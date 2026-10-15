"""Admin panel: sign-in, inventory management and the customer inquiries inbox."""
import csv
import io
import secrets
import time
import uuid
from collections import defaultdict
from functools import wraps
from pathlib import Path

from flask import (Blueprint, Response, abort, current_app, flash, redirect,
                   render_template, request, session, url_for)
from PIL import Image, UnidentifiedImageError
from werkzeug.security import check_password_hash, generate_password_hash

import database as db

bp = Blueprint("admin", __name__, url_prefix="/admin", template_folder="templates")

ALLOWED_IMAGE_FORMATS = {"JPEG": ".jpg", "PNG": ".png", "WEBP": ".webp"}
MAX_IMAGE_SIDE = 2000
_failed_logins = defaultdict(list)


# ------------------------------------------------------------------ helpers

def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("admin"):
            return redirect(url_for("admin.login", next=request.path))
        return view(*args, **kwargs)
    return wrapped


def csrf_token():
    if "csrf" not in session:
        session["csrf"] = secrets.token_urlsafe(32)
    return session["csrf"]


@bp.app_context_processor
def inject_helpers():
    return {"csrf_token": csrf_token, "money": money}


@bp.before_request
def check_csrf():
    if request.method == "POST":
        sent = request.form.get("csrf_token", "")
        if not sent or not secrets.compare_digest(sent, session.get("csrf", "")):
            abort(400, "Your session expired. Go back, refresh the page and try again.")


def money(value):
    return f"KSh {int(value or 0):,}"


def _to_int(value, default=0):
    try:
        return int(str(value).replace(",", "").strip())
    except (TypeError, ValueError):
        return default


def save_upload(file_storage):
    """Validate an uploaded photo, shrink it if huge, and store it under /uploads."""
    try:
        img = Image.open(file_storage.stream)
        img.verify()
        file_storage.stream.seek(0)
        img = Image.open(file_storage.stream)
    except (UnidentifiedImageError, OSError):
        return None
    ext = ALLOWED_IMAGE_FORMATS.get(img.format)
    if not ext:
        return None
    if img.mode not in ("RGB", "RGBA") or (ext == ".jpg" and img.mode != "RGB"):
        img = img.convert("RGBA" if ext != ".jpg" and "A" in img.getbands() else "RGB")
    img.thumbnail((MAX_IMAGE_SIDE, MAX_IMAGE_SIDE))
    name = f"{uuid.uuid4().hex}{ext}"
    img.save(Path(current_app.config["UPLOAD_FOLDER"]) / name, quality=85, optimize=True)
    return f"uploads/{name}"


def remove_upload(path):
    """Delete an uploaded file. Bundled site images are never touched."""
    if path.startswith("uploads/"):
        target = Path(current_app.config["UPLOAD_FOLDER"]) / Path(path).name
        target.unlink(missing_ok=True)


def back(default):
    """Return to the admin page the form came from (never to another site)."""
    target = request.form.get("next", "")
    if target.startswith("/admin") and not target.startswith("//"):
        return redirect(target)
    return redirect(default)


def vehicle_from_form(form):
    errors = []
    data = {
        "make": form.get("make", "").strip(),
        "model": form.get("model", "").strip(),
        "trim": form.get("trim", "").strip(),
        "year": _to_int(form.get("year")),
        "price": _to_int(form.get("price")),
        "mileage": _to_int(form.get("mileage")),
        "engine_cc": _to_int(form.get("engine_cc")),
        "transmission": form.get("transmission", "Automatic"),
        "fuel": form.get("fuel", "Petrol"),
        "body_type": form.get("body_type", "SUV"),
        "condition": form.get("condition", "Used"),
        "exterior_color": form.get("exterior_color", "").strip(),
        "interior_color": form.get("interior_color", "").strip(),
        "drivetrain": form.get("drivetrain", "").strip(),
        "description": form.get("description", "").strip(),
        "features": [f.strip() for f in form.get("features", "").splitlines() if f.strip()],
        "status": form.get("status", "available"),
        "featured": form.get("featured") == "on",
    }
    if not data["make"]:
        errors.append("Make is required.")
    if not data["model"]:
        errors.append("Model is required.")
    if not 1950 <= data["year"] <= time.localtime().tm_year + 1:
        errors.append("Enter a valid year.")
    if data["price"] < 0:
        errors.append("Price can't be negative.")
    if data["status"] not in db.VEHICLE_STATUSES:
        errors.append("Unknown status.")
    return data, errors


# ------------------------------------------------------------ auth screens

@bp.route("/setup", methods=["GET", "POST"])
def setup():
    if db.admin_count():
        return redirect(url_for("admin.login"))
    error = None
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        if not username or len(password) < 8:
            error = "Choose a username and a password of at least 8 characters."
        elif password != request.form.get("confirm"):
            error = "Passwords don't match."
        else:
            db.create_admin(username, generate_password_hash(password))
            session.clear()
            session["admin"] = username
            flash("Admin account created. Welcome!")
            return redirect(url_for("admin.dashboard"))
    return render_template("admin/setup.html", error=error)


@bp.route("/login", methods=["GET", "POST"])
def login():
    if not db.admin_count():
        return redirect(url_for("admin.setup"))
    error = None
    if request.method == "POST":
        ip = request.remote_addr or "unknown"
        recent = [t for t in _failed_logins[ip] if t > time.time() - 900]
        _failed_logins[ip] = recent
        username = request.form.get("username", "").strip()
        user = db.get_admin(username)
        if len(recent) >= 5:
            error = "Too many failed attempts. Try again in 15 minutes."
        elif user and check_password_hash(user["password_hash"], request.form.get("password", "")):
            session.clear()
            session["admin"] = user["username"]
            target = request.args.get("next", "")
            if not target.startswith("/admin") or target.startswith("//"):
                target = url_for("admin.dashboard")
            return redirect(target)
        else:
            _failed_logins[ip].append(time.time())
            error = "Wrong username or password."
    return render_template("admin/login.html", error=error)


@bp.post("/logout")
def logout():
    session.clear()
    return redirect(url_for("admin.login"))


@bp.route("/account", methods=["GET", "POST"])
@login_required
def account():
    error = None
    if request.method == "POST":
        user = db.get_admin(session["admin"])
        new = request.form.get("new_password", "")
        if not check_password_hash(user["password_hash"], request.form.get("current_password", "")):
            error = "Current password is wrong."
        elif len(new) < 8:
            error = "New password must be at least 8 characters."
        elif new != request.form.get("confirm"):
            error = "New passwords don't match."
        else:
            db.set_admin_password(user["username"], generate_password_hash(new))
            flash("Password updated.")
            return redirect(url_for("admin.account"))
    return render_template("admin/account.html", error=error)


# --------------------------------------------------------------- dashboard

@bp.get("/")
@login_required
def dashboard():
    return render_template(
        "admin/dashboard.html",
        stats=db.stats(),
        inquiries=db.list_inquiries(limit=6),
        vehicles=db.list_vehicles(public=False)[:6],
    )


# ---------------------------------------------------------------- vehicles

@bp.get("/vehicles")
@login_required
def vehicles():
    q = request.args.get("q", "").strip()
    status = request.args.get("status", "")
    return render_template(
        "admin/vehicles.html",
        vehicles=db.list_vehicles(public=False, q=q, status=status if status in db.VEHICLE_STATUSES else ""),
        q=q, status=status,
    )


def _render_vehicle_form(vehicle, errors=(), status=200):
    return render_template(
        "admin/vehicle_form.html", vehicle=vehicle, errors=errors,
        statuses=db.VEHICLE_STATUSES, body_types=db.BODY_TYPES, fuels=db.FUELS,
        transmissions=db.TRANSMISSIONS, conditions=db.CONDITIONS,
    ), status


def _apply_images(data, existing):
    keep = [p for p in existing if p not in request.form.getlist("remove_image")]
    for p in existing:
        if p not in keep:
            remove_upload(p)
    rejected = 0
    for f in request.files.getlist("photos"):
        if f and f.filename:
            path = save_upload(f)
            if path:
                keep.append(path)
            else:
                rejected += 1
    cover = request.form.get("cover")
    if cover in keep:
        keep.remove(cover)
        keep.insert(0, cover)
    data["images"] = keep
    if rejected:
        flash(f"{rejected} file(s) skipped: only JPG, PNG and WEBP photos are accepted.")


@bp.route("/vehicles/new", methods=["GET", "POST"])
@login_required
def vehicle_new():
    if request.method == "POST":
        data, errors = vehicle_from_form(request.form)
        if errors:
            return _render_vehicle_form({**data, "images": []}, errors, 400)
        _apply_images(data, [])
        db.create_vehicle(data)
        flash(f"{data['year']} {data['make']} {data['model']} added to inventory.")
        return redirect(url_for("admin.vehicles"))
    return _render_vehicle_form({"status": "available", "year": time.localtime().tm_year, "images": []})


@bp.route("/vehicles/<int:vehicle_id>/edit", methods=["GET", "POST"])
@login_required
def vehicle_edit(vehicle_id):
    vehicle = db.get_vehicle(vehicle_id, public=False)
    if not vehicle:
        abort(404)
    if request.method == "POST":
        data, errors = vehicle_from_form(request.form)
        if errors:
            return _render_vehicle_form({**vehicle, **data}, errors, 400)
        _apply_images(data, vehicle["images"])
        db.update_vehicle(vehicle_id, data)
        flash("Vehicle updated.")
        return redirect(url_for("admin.vehicles"))
    return _render_vehicle_form(vehicle)


@bp.post("/vehicles/<int:vehicle_id>/status")
@login_required
def vehicle_status(vehicle_id):
    status = request.form.get("status")
    if status in db.VEHICLE_STATUSES and db.get_vehicle(vehicle_id, public=False):
        db.update_vehicle(vehicle_id, {"status": status})
        flash(f"Marked as {status}.")
    return back(url_for("admin.vehicles"))


@bp.post("/vehicles/<int:vehicle_id>/delete")
@login_required
def vehicle_delete(vehicle_id):
    vehicle = db.get_vehicle(vehicle_id, public=False)
    if vehicle:
        for p in vehicle["images"]:
            remove_upload(p)
        db.delete_vehicle(vehicle_id)
        flash(f"{vehicle['title']} deleted.")
    return redirect(url_for("admin.vehicles"))


# --------------------------------------------------------------- inquiries

KIND_LABELS = {"contact": "Contact", "test_drive": "Test drive", "finance": "Finance"}


@bp.get("/inquiries")
@login_required
def inquiries():
    kind = request.args.get("kind", "")
    status = request.args.get("status", "")
    items = db.list_inquiries(
        kind=kind if kind in db.INQUIRY_KINDS else "",
        status=status if status in db.INQUIRY_STATUSES else "",
    )
    return render_template("admin/inquiries.html", inquiries=items, kind=kind, status=status,
                           kinds=KIND_LABELS, statuses=db.INQUIRY_STATUSES)


@bp.get("/inquiries/<int:inquiry_id>")
@login_required
def inquiry(inquiry_id):
    item = db.get_inquiry(inquiry_id)
    if not item:
        abort(404)
    return render_template("admin/inquiry.html", inquiry=item, kinds=KIND_LABELS,
                           statuses=db.INQUIRY_STATUSES)


@bp.post("/inquiries/<int:inquiry_id>/status")
@login_required
def inquiry_status(inquiry_id):
    status = request.form.get("status")
    if status in db.INQUIRY_STATUSES:
        db.set_inquiry_status(inquiry_id, status)
        flash(f"Inquiry marked as {status}.")
    return back(url_for("admin.inquiry", inquiry_id=inquiry_id))


@bp.post("/inquiries/<int:inquiry_id>/delete")
@login_required
def inquiry_delete(inquiry_id):
    db.delete_inquiry(inquiry_id)
    flash("Inquiry deleted.")
    return redirect(url_for("admin.inquiries"))


@bp.get("/inquiries.csv")
@login_required
def inquiries_csv():
    out = io.StringIO()
    writer = csv.writer(out)
    writer.writerow(["id", "date", "type", "status", "name", "email", "phone", "vehicle", "subject", "message", "details"])
    for i in db.list_inquiries():
        details = "; ".join(f"{k}: {v}" for k, v in i["details"].items())
        row = [i["id"], i["created_at"], KIND_LABELS.get(i["kind"], i["kind"]), i["status"], i["name"],
               i["email"], i["phone"], i["vehicle_title"] or "", i["subject"], i["message"], details]
        # Stop spreadsheet apps from treating customer text as formulas.
        writer.writerow(["'" + c if isinstance(c, str) and c[:1] in "=+-@" else c for c in row])
    return Response(out.getvalue(), mimetype="text/csv",
                    headers={"Content-Disposition": "attachment; filename=inquiries.csv"})
