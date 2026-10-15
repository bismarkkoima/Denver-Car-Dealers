"""Denver Car Dealership — website server, public API and admin panel.

Run locally:
    pip install -r requirements.txt
    python app.py            # http://127.0.0.1:5000  (admin at /admin)
"""
import os
import re
import secrets
import time
from collections import defaultdict, deque
from pathlib import Path

import click
from flask import Flask, Response, abort, jsonify, request, send_from_directory
from markupsafe import escape
from werkzeug.security import generate_password_hash

import database as db
import notify
from media import save_upload

ROOT = Path(__file__).resolve().parent
PUBLIC_DIRS = {"css", "js", "images", "videos", "fonts", "assets", "data"}
# Where the database, secret key and uploaded photos live. On a host, point
# DCD_DATA_DIR at a persistent disk so they survive redeploys.
DATA_DIR = Path(os.environ.get("DCD_DATA_DIR") or ROOT / "instance")
LONG_CACHE = ("/images/", "/videos/", "/fonts/", "/uploads/")
MAX_SELL_PHOTOS = 8
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _secret_key(instance_path):
    key = os.environ.get("DCD_SECRET_KEY")
    if key:
        return key
    key_file = Path(instance_path) / "secret_key"
    if not key_file.exists():
        key_file.write_text(secrets.token_hex(32))
    return key_file.read_text().strip()


def create_app(test_config=None):
    app = Flask(__name__, static_folder=None, instance_path=str(DATA_DIR))
    Path(app.instance_path).mkdir(parents=True, exist_ok=True)
    app.config.update(
        DATABASE=str(DATA_DIR / "dealership.db"),
        UPLOAD_FOLDER=str(DATA_DIR / "uploads" if os.environ.get("DCD_DATA_DIR") else ROOT / "uploads"),
        SEED_FILE=str(ROOT / "data" / "inventory.json"),
        MAX_CONTENT_LENGTH=40 * 1024 * 1024,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=os.environ.get("DCD_SECURE_COOKIES") == "1",
    )
    if test_config:
        app.config.update(test_config)
    app.secret_key = app.config.get("SECRET_KEY") or _secret_key(app.instance_path)
    Path(app.config["UPLOAD_FOLDER"]).mkdir(parents=True, exist_ok=True)

    app.teardown_appcontext(db.close_db)
    with app.app_context():
        db.init_db(app.config["SEED_FILE"])

    from admin import bp as admin_bp
    app.register_blueprint(admin_bp)

    register_api(app)
    register_site(app)
    register_cli(app)
    return app


# ---------------------------------------------------------------- public API

_recent_posts = defaultdict(deque)


def _rate_limited(key, limit=8, window=600):
    """Allow `limit` submissions per `window` seconds per client."""
    hits, t = _recent_posts[key], time.time()
    while hits and hits[0] < t - window:
        hits.popleft()
    if len(hits) >= limit:
        return True
    hits.append(t)
    return False


def _clean(value, max_len=200):
    return str(value or "").strip()[:max_len]


def register_api(app):
    @app.get("/api/vehicles")
    def api_vehicles():
        return jsonify({"vehicles": db.list_vehicles(public=True)})

    @app.get("/api/vehicles/<key>")
    def api_vehicle(key):
        vehicle = db.get_vehicle(key, public=True)
        if not vehicle:
            return jsonify({"error": "Vehicle not found"}), 404
        return jsonify(vehicle)

    @app.post("/api/inquiries")
    def api_inquiry():
        data = request.get_json(silent=True) or request.form.to_dict()
        # Honeypot field: real visitors never see or fill it.
        if data.get("website"):
            return jsonify({"ok": True}), 201

        kind = data.get("kind")
        email = _clean(data.get("email"), 160)
        phone = _clean(data.get("phone"), 40)
        name = _clean(data.get("name"), 120) or (email if kind == "newsletter" else "")
        photos = [f for f in request.files.getlist("photos") if f and f.filename] if kind == "sell" else []
        errors = {}
        if kind not in db.INQUIRY_KINDS:
            errors["kind"] = "Unknown form type."
        if not name:
            errors["name"] = "Please enter your name."
        if email and not EMAIL_RE.match(email):
            errors["email"] = "Please enter a valid email address."
        if kind == "newsletter" and not email:
            errors["email"] = "Please enter your email address."
        elif not email and not phone:
            errors["email"] = "Please give us an email address or phone number."
        if len(photos) > MAX_SELL_PHOTOS:
            errors["photos"] = f"Please send at most {MAX_SELL_PHOTOS} photos."
        if errors:
            return jsonify({"error": "Please check the form.", "fields": errors}), 400

        if _rate_limited(request.remote_addr or "unknown"):
            return jsonify({"error": "Too many submissions. Please call us instead."}), 429

        if kind == "newsletter" and db.is_subscribed(email):
            return jsonify({"ok": True, "already": True}), 201

        vehicle_id = None
        if data.get("vehicle"):
            vehicle = db.get_vehicle(str(data["vehicle"]), public=True)
            vehicle_id = vehicle["id"] if vehicle else None

        saved = [p for p in (save_upload(f, max_side=1600) for f in photos) if p]
        if photos and not saved:
            return jsonify({"error": "Those photos couldn't be read. Please use JPG, PNG or WEBP images.",
                            "fields": {"photos": "Please use JPG, PNG or WEBP images."}}), 400

        known = {"kind", "name", "email", "phone", "subject", "message", "vehicle", "website"}
        details = {k: _clean(v) for k, v in list(data.items())[:40] if k not in known and _clean(v)}
        inquiry_id = db.create_inquiry(
            kind, name, email, phone,
            subject=_clean(data.get("subject"), 200),
            message=_clean(data.get("message"), 4000),
            vehicle_id=vehicle_id,
            details=details,
            photos=saved,
        )
        if kind != "newsletter":
            notify.notify_inquiry(db.get_inquiry(inquiry_id),
                                  admin_url=request.url_root.rstrip("/") + f"/admin/inquiries/{inquiry_id}")
        return jsonify({"ok": True, "id": inquiry_id}), 201

    @app.get("/sitemap.xml")
    def sitemap():
        base = request.url_root.rstrip("/")
        pages = ["", "vehicles", "financing", "testdrive", "sell", "service", "compare", "about", "contact"]
        urls = [f"{base}/{p}" for p in pages]
        urls += [f"{base}/vehicle?id={v['slug']}" for v in db.list_vehicles(public=True)]
        body = "".join(f"<url><loc>{escape(u)}</loc></url>" for u in urls)
        xml = f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{body}</urlset>'
        return Response(xml, mimetype="application/xml")


# ------------------------------------------------------------ static website

def register_site(app):
    @app.get("/")
    def home():
        return send_from_directory(ROOT, "index.html")

    @app.get("/<path:path>")
    def site(path):
        top = path.split("/", 1)[0]
        if top == "uploads" and "/" in path:
            return send_from_directory(app.config["UPLOAD_FOLDER"], path.split("/", 1)[1])
        if path == "robots.txt":
            rules = (ROOT / "robots.txt").read_text()
            return Response(f"{rules}\nSitemap: {request.url_root}sitemap.xml\n", mimetype="text/plain")
        if "/" in path and top in PUBLIC_DIRS:
            return send_from_directory(ROOT, path)
        # Pretty URLs: /vehicles -> vehicles.html
        page = path.removesuffix(".html")
        if "/" not in page and re.fullmatch(r"[a-z0-9-]+", page) and (ROOT / f"{page}.html").exists():
            return send_from_directory(ROOT, f"{page}.html")
        abort(404)

    @app.after_request
    def headers(res):
        res.headers.setdefault("X-Content-Type-Options", "nosniff")
        res.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        res.headers.setdefault("X-Frame-Options", "SAMEORIGIN")
        if request.path.startswith(LONG_CACHE) and res.status_code == 200:
            res.headers["Cache-Control"] = "public, max-age=604800"
        elif request.path.startswith("/admin"):
            res.headers["Cache-Control"] = "no-store"
        return res

    @app.errorhandler(404)
    def not_found(_e):
        if request.path.startswith("/api/"):
            return jsonify({"error": "Not found"}), 404
        return send_from_directory(ROOT, "404.html"), 404

    @app.errorhandler(413)
    def too_large(_e):
        return "Upload too large (40 MB limit).", 413


def register_cli(app):
    @app.cli.command("create-admin")
    @click.argument("username")
    @click.password_option()
    def create_admin(username, password):
        """Create an admin account: flask --app app create-admin USERNAME"""
        if db.get_admin(username):
            db.set_admin_password(username, generate_password_hash(password))
            click.echo(f"Password updated for {username}.")
        else:
            db.create_admin(username, generate_password_hash(password))
            click.echo(f"Admin {username} created.")


app = create_app()

if __name__ == "__main__":
    app.run(
        host=os.environ.get("HOST", "127.0.0.1"),
        port=int(os.environ.get("PORT", 5000)),
        debug=os.environ.get("FLASK_DEBUG") == "1",
    )
