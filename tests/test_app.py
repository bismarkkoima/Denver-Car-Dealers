"""Run with:  python -m unittest discover tests"""
import io
import re
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app  # noqa: E402


class AppTestCase(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.app = create_app({
            "TESTING": True,
            "SECRET_KEY": "test",
            "DATABASE": str(self.tmp / "test.db"),
            "UPLOAD_FOLDER": str(self.tmp / "uploads"),
        })
        self.client = self.app.test_client()

    def tearDown(self):
        shutil.rmtree(self.tmp)

    # -------------------------------------------------------- helpers
    def csrf(self, path):
        html = self.client.get(path).get_data(as_text=True)
        return re.search(r'name="csrf_token" value="([^"]+)"', html).group(1)

    def sign_in(self):
        token = self.csrf("/admin/setup")
        res = self.client.post("/admin/setup", data={
            "csrf_token": token, "username": "boss", "password": "supersecret", "confirm": "supersecret",
        })
        self.assertEqual(res.status_code, 302)

    # ----------------------------------------------------------- site
    def test_pages_render(self):
        for path in ["/", "/vehicles", "/vehicle", "/financing", "/testdrive", "/contact", "/about"]:
            with self.client.get(path) as res:
                self.assertEqual(res.status_code, 200, path)

    def test_private_files_not_served(self):
        for path in ["/app.py", "/database.py", "/admin/routes.py", "/instance/dealership.db", "/.git/config"]:
            with self.client.get(path) as res:
                self.assertEqual(res.status_code, 404, path)

    # ------------------------------------------------------------ API
    def test_public_inventory_hides_drafts(self):
        vehicles = self.client.get("/api/vehicles").get_json()["vehicles"]
        self.assertEqual(len(vehicles), 8)
        self.sign_in()
        token = self.csrf("/admin/vehicles")
        first = vehicles[0]
        self.client.post(f"/admin/vehicles/{first['id']}/status", data={"csrf_token": token, "status": "draft"})
        ids = [v["id"] for v in self.client.get("/api/vehicles").get_json()["vehicles"]]
        self.assertNotIn(first["id"], ids)
        self.assertEqual(self.client.get(f"/api/vehicles/{first['slug']}").status_code, 404)

    def test_inquiry_validation_and_storage(self):
        res = self.client.post("/api/inquiries", json={"kind": "contact", "name": ""})
        self.assertEqual(res.status_code, 400)
        res = self.client.post("/api/inquiries", json={
            "kind": "test_drive", "name": "Jane", "phone": "+254700000000",
            "vehicle": "2023-lexus-lx-600", "preferred_date": "2026-11-01",
        })
        self.assertEqual(res.status_code, 201)
        self.sign_in()
        html = self.client.get(f"/admin/inquiries/{res.get_json()['id']}").get_data(as_text=True)
        self.assertIn("Jane", html)
        self.assertIn("2023 Lexus LX 600", html)
        self.assertIn("2026-11-01", html)

    def test_honeypot_is_silently_dropped(self):
        res = self.client.post("/api/inquiries", json={"kind": "contact", "name": "Bot", "email": "a@b.co", "website": "x"})
        self.assertEqual(res.status_code, 201)
        self.assertNotIn("id", res.get_json())

    # ---------------------------------------------------------- admin
    def test_admin_requires_login(self):
        self.assertIn("/admin/login", self.client.get("/admin/").headers["Location"])

    def test_setup_only_once(self):
        self.sign_in()
        self.client.post("/admin/logout", data={"csrf_token": self.csrf("/admin/")})
        self.assertIn("/admin/login", self.client.get("/admin/setup").headers["Location"])

    def test_post_without_csrf_rejected(self):
        self.sign_in()
        self.assertEqual(self.client.post("/admin/vehicles/1/delete").status_code, 400)

    def test_add_vehicle_with_photo(self):
        self.sign_in()
        token = self.csrf("/admin/vehicles/new")
        buf = io.BytesIO()
        Image.new("RGB", (3000, 2000), "red").save(buf, "PNG")
        buf.seek(0)
        res = self.client.post("/admin/vehicles/new", data={
            "csrf_token": token, "make": "Subaru", "model": "Forester", "year": "2019",
            "price": "3,200,000", "status": "available", "features": "AWD\nEyeSight",
            "photos": [(buf, "car.png"), (io.BytesIO(b"not an image"), "evil.php")],
        }, content_type="multipart/form-data")
        self.assertEqual(res.status_code, 302)
        car = self.client.get("/api/vehicles/2019-subaru-forester").get_json()
        self.assertEqual(car["price"], 3200000)
        self.assertEqual(car["features"], ["AWD", "EyeSight"])
        self.assertEqual(len(car["images"]), 1)
        saved = Image.open(self.tmp / car["images"][0])
        self.assertLessEqual(max(saved.size), 2000)

    def test_csv_export_neutralises_formulas(self):
        self.client.post("/api/inquiries", json={"kind": "contact", "name": "=HYPERLINK(1)", "email": "a@b.co"})
        self.sign_in()
        body = self.client.get("/admin/inquiries.csv").get_data(as_text=True)
        self.assertIn("'=HYPERLINK(1)", body)


if __name__ == "__main__":
    unittest.main()
