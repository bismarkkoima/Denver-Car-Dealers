"""SQLite storage for vehicles, customer inquiries and admin accounts."""
import json
import re
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from flask import current_app, g

SCHEMA = """
CREATE TABLE IF NOT EXISTS vehicles (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    slug            TEXT UNIQUE NOT NULL,
    make            TEXT NOT NULL,
    model           TEXT NOT NULL,
    trim            TEXT DEFAULT '',
    year            INTEGER NOT NULL,
    price           INTEGER NOT NULL DEFAULT 0,
    mileage         INTEGER NOT NULL DEFAULT 0,
    transmission    TEXT DEFAULT 'Automatic',
    fuel            TEXT DEFAULT 'Petrol',
    engine_cc       INTEGER DEFAULT 0,
    body_type       TEXT DEFAULT 'SUV',
    condition       TEXT DEFAULT 'Used',
    exterior_color  TEXT DEFAULT '',
    interior_color  TEXT DEFAULT '',
    drivetrain      TEXT DEFAULT '',
    description     TEXT DEFAULT '',
    features        TEXT DEFAULT '[]',
    images          TEXT DEFAULT '[]',
    status          TEXT NOT NULL DEFAULT 'available',
    featured        INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inquiries (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    kind        TEXT NOT NULL,
    name        TEXT NOT NULL,
    email       TEXT DEFAULT '',
    phone       TEXT DEFAULT '',
    subject     TEXT DEFAULT '',
    message     TEXT DEFAULT '',
    vehicle_id  INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
    details     TEXT DEFAULT '{}',
    status      TEXT NOT NULL DEFAULT 'new',
    created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admins (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL
);
"""

VEHICLE_STATUSES = ("available", "reserved", "sold", "draft")
PUBLIC_STATUSES = ("available", "reserved", "sold")
INQUIRY_KINDS = ("contact", "test_drive", "finance")
INQUIRY_STATUSES = ("new", "contacted", "closed")
BODY_TYPES = ("SUV", "Sedan", "Coupe", "Pickup", "Hatchback", "Wagon", "Convertible", "Van")
FUELS = ("Petrol", "Diesel", "Hybrid", "Electric")
TRANSMISSIONS = ("Automatic", "Manual")
CONDITIONS = ("New", "Used", "Foreign Used")

VEHICLE_FIELDS = (
    "make", "model", "trim", "year", "price", "mileage", "transmission", "fuel",
    "engine_cc", "body_type", "condition", "exterior_color", "interior_color",
    "drivetrain", "description", "features", "images", "status", "featured",
)


def now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(current_app.config["DATABASE"])
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


def close_db(_exc=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db(seed_file=None):
    db = get_db()
    db.executescript(SCHEMA)
    db.commit()
    empty = db.execute("SELECT COUNT(*) FROM vehicles").fetchone()[0] == 0
    if empty and seed_file and Path(seed_file).exists():
        import_vehicles(json.loads(Path(seed_file).read_text())["vehicles"])


# ---------------------------------------------------------------- vehicles

def slugify(*parts):
    text = "-".join(str(p) for p in parts if p)
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-") or "vehicle"


def unique_slug(base, exclude_id=None):
    db = get_db()
    slug, n = base, 2
    while True:
        row = db.execute("SELECT id FROM vehicles WHERE slug = ?", (slug,)).fetchone()
        if row is None or row["id"] == exclude_id:
            return slug
        slug, n = f"{base}-{n}", n + 1


def vehicle_to_dict(row):
    if row is None:
        return None
    v = dict(row)
    v["features"] = json.loads(v["features"] or "[]")
    v["images"] = json.loads(v["images"] or "[]")
    v["featured"] = bool(v["featured"])
    v["title"] = f"{v['year']} {v['make']} {v['model']}"
    return v


def list_vehicles(public=True, q="", status=""):
    sql, args = "SELECT * FROM vehicles WHERE 1=1", []
    if public:
        sql += f" AND status IN ({','.join('?' * len(PUBLIC_STATUSES))})"
        args += PUBLIC_STATUSES
    if status:
        sql += " AND status = ?"
        args.append(status)
    if q:
        sql += " AND (make || ' ' || model || ' ' || trim || ' ' || year) LIKE ?"
        args.append(f"%{q}%")
    sql += " ORDER BY featured DESC, CASE status WHEN 'sold' THEN 1 ELSE 0 END, created_at DESC, id DESC"
    return [vehicle_to_dict(r) for r in get_db().execute(sql, args)]


def get_vehicle(key, public=True):
    db = get_db()
    col = "id" if str(key).isdigit() else "slug"
    row = db.execute(f"SELECT * FROM vehicles WHERE {col} = ?", (key,)).fetchone()
    v = vehicle_to_dict(row)
    if v and public and v["status"] not in PUBLIC_STATUSES:
        return None
    return v


def _vehicle_values(data):
    vals = {f: data.get(f) for f in VEHICLE_FIELDS if f in data}
    for f in ("features", "images"):
        if f in vals and not isinstance(vals[f], str):
            vals[f] = json.dumps(vals[f] or [])
    if "featured" in vals:
        vals["featured"] = 1 if vals["featured"] else 0
    return vals


def create_vehicle(data):
    vals = _vehicle_values(data)
    vals["slug"] = unique_slug(data.get("slug") or slugify(data.get("year"), data["make"], data["model"]))
    vals["created_at"] = vals["updated_at"] = now()
    cols = ", ".join(vals)
    db = get_db()
    cur = db.execute(f"INSERT INTO vehicles ({cols}) VALUES ({', '.join('?' * len(vals))})", list(vals.values()))
    db.commit()
    return cur.lastrowid


def update_vehicle(vehicle_id, data):
    vals = _vehicle_values(data)
    vals["updated_at"] = now()
    sets = ", ".join(f"{c} = ?" for c in vals)
    db = get_db()
    db.execute(f"UPDATE vehicles SET {sets} WHERE id = ?", [*vals.values(), vehicle_id])
    db.commit()


def delete_vehicle(vehicle_id):
    db = get_db()
    db.execute("DELETE FROM vehicles WHERE id = ?", (vehicle_id,))
    db.commit()


def import_vehicles(items, replace=False):
    db = get_db()
    if replace:
        db.execute("DELETE FROM vehicles")
        db.commit()
    return [create_vehicle(item) for item in items]


# --------------------------------------------------------------- inquiries

def create_inquiry(kind, name, email="", phone="", subject="", message="", vehicle_id=None, details=None):
    db = get_db()
    cur = db.execute(
        "INSERT INTO inquiries (kind, name, email, phone, subject, message, vehicle_id, details, created_at)"
        " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (kind, name, email, phone, subject, message, vehicle_id, json.dumps(details or {}), now()),
    )
    db.commit()
    return cur.lastrowid


def _inquiry_to_dict(row):
    d = dict(row)
    d["details"] = json.loads(d["details"] or "{}")
    return d


def list_inquiries(kind="", status="", limit=None):
    sql = ("SELECT i.*, v.year || ' ' || v.make || ' ' || v.model AS vehicle_title"
           " FROM inquiries i LEFT JOIN vehicles v ON v.id = i.vehicle_id WHERE 1=1")
    args = []
    if kind:
        sql += " AND i.kind = ?"
        args.append(kind)
    if status:
        sql += " AND i.status = ?"
        args.append(status)
    sql += " ORDER BY i.created_at DESC, i.id DESC"
    if limit:
        sql += " LIMIT ?"
        args.append(limit)
    return [_inquiry_to_dict(r) for r in get_db().execute(sql, args)]


def get_inquiry(inquiry_id):
    row = get_db().execute(
        "SELECT i.*, v.year || ' ' || v.make || ' ' || v.model AS vehicle_title, v.slug AS vehicle_slug"
        " FROM inquiries i LEFT JOIN vehicles v ON v.id = i.vehicle_id WHERE i.id = ?",
        (inquiry_id,),
    ).fetchone()
    return _inquiry_to_dict(row) if row else None


def set_inquiry_status(inquiry_id, status):
    db = get_db()
    db.execute("UPDATE inquiries SET status = ? WHERE id = ?", (status, inquiry_id))
    db.commit()


def delete_inquiry(inquiry_id):
    db = get_db()
    db.execute("DELETE FROM inquiries WHERE id = ?", (inquiry_id,))
    db.commit()


def stats():
    db = get_db()
    by_status = dict(db.execute("SELECT status, COUNT(*) FROM vehicles GROUP BY status").fetchall())
    new_inq = db.execute("SELECT COUNT(*) FROM inquiries WHERE status = 'new'").fetchone()[0]
    total_inq = db.execute("SELECT COUNT(*) FROM inquiries").fetchone()[0]
    stock_value = db.execute(
        "SELECT COALESCE(SUM(price), 0) FROM vehicles WHERE status IN ('available', 'reserved')"
    ).fetchone()[0]
    return {
        "available": by_status.get("available", 0),
        "reserved": by_status.get("reserved", 0),
        "sold": by_status.get("sold", 0),
        "draft": by_status.get("draft", 0),
        "new_inquiries": new_inq,
        "total_inquiries": total_inq,
        "stock_value": stock_value,
    }


# ------------------------------------------------------------------ admins

def admin_count():
    return get_db().execute("SELECT COUNT(*) FROM admins").fetchone()[0]


def get_admin(username):
    return get_db().execute("SELECT * FROM admins WHERE username = ?", (username,)).fetchone()


def create_admin(username, password_hash):
    db = get_db()
    db.execute("INSERT INTO admins (username, password_hash, created_at) VALUES (?, ?, ?)",
               (username, password_hash, now()))
    db.commit()


def set_admin_password(username, password_hash):
    db = get_db()
    db.execute("UPDATE admins SET password_hash = ? WHERE username = ?", (password_hash, username))
    db.commit()
