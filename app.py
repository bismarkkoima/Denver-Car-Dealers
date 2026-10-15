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
from flask import Flask, abort, jsonify, request, send_from_directory
from werkzeug.security import generate_password_hash

import database as db

ROOT = Path(__file__).resolve().parent
PUBLIC_DIRS = {"css", "js", "images", "videos", "fonts", "assets", "data", "uploads"}
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
    app = Flask(__name__, static_folder=None, instance_path=str(ROOT / "instance"))
    Path(app.instance_path).mkdir(exist_ok=True)
    app.config.update(
        DATABASE=str(Path(app.instance_path) / "dealership.db"),
        UPLOAD_FOLDER=str(ROOT / "uploads"),
        SEED_FILE=str(ROOT / "data" / "inventory.json"),
        MAX_CONTENT_LENGTH=40 * 1024 * 1024,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=os.environ.get("DCD_SECURE_COOKIES") == "1",
    )
    if test_config:
        app.config.update(test_config)
    app.secret_key = app.config.get("SECRET_KEY") or _secret_key(app.instance_path)
    Path(app.config["UPLOAD_FOLDER"]).mkdir(exist_ok=True)

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
        name = _clean(data.get("name"), 120)
        email = _clean(data.get("email"), 160)
        phone = _clean(data.get("phone"), 40)
        errors = {}
        if kind not in db.INQUIRY_KINDS:
            errors["kind"] = "Unknown form type."
        if not name:
            errors["name"] = "Please enter your name."
        if email and not EMAIL_RE.match(email):
            errors["email"] = "Please enter a valid email address."
        if not email and not phone:
            errors["email"] = "Please give us an email address or phone number."
        if errors:
            return jsonify({"error": "Please check the form.", "fields": errors}), 400

        if _rate_limited(request.remote_addr or "unknown"):
            return jsonify({"error": "Too many submissions. Please call us instead."}), 429

        vehicle_id = None
        if data.get("vehicle"):
            vehicle = db.get_vehicle(str(data["vehicle"]), public=True)
            vehicle_id = vehicle["id"] if vehicle else None

        known = {"kind", "name", "email", "phone", "subject", "message", "vehicle", "website"}
        details = {k: _clean(v) for k, v in data.items() if k not in known and _clean(v)}
        inquiry_id = db.create_inquiry(
            kind, name, email, phone,
            subject=_clean(data.get("subject"), 200),
            message=_clean(data.get("message"), 4000),
            vehicle_id=vehicle_id,
            details=details,
        )
        return jsonify({"ok": True, "id": inquiry_id}), 201


# ------------------------------------------------------------ static website

def register_site(app):
    @app.get("/")
    def home():
        return send_from_directory(ROOT, "index.html")

    @app.get("/<path:path>")
    def site(path):
        top = path.split("/", 1)[0]
        if "/" in path and top in PUBLIC_DIRS:
            return send_from_directory(ROOT, path)
        # Pretty URLs: /vehicles -> vehicles.html
        page = path.removesuffix(".html")
        if "/" not in page and re.fullmatch(r"[a-z0-9-]+", page) and (ROOT / f"{page}.html").exists():
            return send_from_directory(ROOT, f"{page}.html")
        abort(404)

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
    app.run(debug=os.environ.get("FLASK_DEBUG") == "1", port=int(os.environ.get("PORT", 5000)))
