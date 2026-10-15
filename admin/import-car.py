"""Bulk-import vehicles into the dealership database.

Usage:
    python admin/import-car.py cars.json            # add the vehicles in a JSON file
    python admin/import-car.py cars.csv             # ...or a CSV file
    python admin/import-car.py cars.json --replace  # wipe current inventory first

JSON format: {"vehicles": [{...}, ...]} (same as data/inventory.json).
CSV format: a header row with column names such as
    make,model,trim,year,price,mileage,transmission,fuel,engine_cc,body_type,
    condition,exterior_color,interior_color,drivetrain,description,features,images,status,featured
`features` and `images` are separated with "|" in CSV.
"""
import argparse
import csv
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import database as db  # noqa: E402
from app import create_app  # noqa: E402

INT_FIELDS = ("year", "price", "mileage", "engine_cc")


def read_csv(path):
    rows = []
    with open(path, newline="", encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            row = {k.strip(): (v or "").strip() for k, v in row.items() if k}
            for key in INT_FIELDS:
                if row.get(key):
                    row[key] = int(row[key].replace(",", ""))
            for key in ("features", "images"):
                if key in row:
                    row[key] = [p.strip() for p in row[key].split("|") if p.strip()]
            if "featured" in row:
                row["featured"] = row["featured"].lower() in ("1", "yes", "true", "y")
            rows.append(row)
    return rows


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("file", type=Path)
    parser.add_argument("--replace", action="store_true", help="delete all current vehicles first")
    args = parser.parse_args()

    if args.file.suffix.lower() == ".csv":
        items = read_csv(args.file)
    else:
        items = json.loads(args.file.read_text())["vehicles"]

    bad = [i for i, v in enumerate(items, 1) if not (v.get("make") and v.get("model") and v.get("year"))]
    if bad:
        sys.exit(f"Rows {bad} are missing make, model or year. Nothing imported.")

    with create_app().app_context():
        ids = db.import_vehicles(items, replace=args.replace)
    print(f"Imported {len(ids)} vehicle(s).")


if __name__ == "__main__":
    main()
