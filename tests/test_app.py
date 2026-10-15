"""Run with:  python -m unittest discover tests"""
import io
import os
import re
import sqlite3
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from unittest import mock  # noqa: E402

import notify  # noqa: E402
import app as app_module  # noqa: E402
from app import create_app  # noqa: E402


class AppTestCase(unittest.TestCase):
    def setUp(self):
        app_module._recent_posts.clear()
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
        for path in ["/", "/vehicles", "/vehicle", "/financing", "/testdrive", "/contact", "/about",
                     "/sell", "/service", "/compare", "/saved"]:
            with self.client.get(path) as res:
                self.assertEqual(res.status_code, 200, path)

    def test_fonts_and_robots_served(self):
        for path in ["/fonts/fonts.css", "/fonts/mona-sans-latin.woff2", "/fonts/mona-sans-latin-ext.woff2", "/robots.txt"]:
            with self.client.get(path) as res:
                self.assertEqual(res.status_code, 200, path)

    def test_private_files_not_served(self):
        for path in ["/app.py", "/database.py", "/admin/routes.py", "/instance/dealership.db", "/.git/config",
                     "/requirements.txt", "/render.yaml", "/uploads/../app.py"]:
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
        with self.client.get("/" + car["images"][0]) as res:
            self.assertEqual(res.status_code, 200)
            self.assertIn("max-age", res.headers["Cache-Control"])

    def test_csv_export_neutralises_formulas(self):
        self.client.post("/api/inquiries", json={"kind": "contact", "name": "=HYPERLINK(1)", "email": "a@b.co"})
        self.sign_in()
        body = self.client.get("/admin/inquiries.csv").get_data(as_text=True)
        self.assertIn("'=HYPERLINK(1)", body)

    # ------------------------------------------------- new features
    @staticmethod
    def jpeg(color="blue"):
        buf = io.BytesIO()
        Image.new("RGB", (800, 600), color).save(buf, "JPEG")
        buf.seek(0)
        return buf

    def test_sell_request_with_photos(self):
        res = self.client.post("/api/inquiries", data={
            "kind": "sell", "name": "Otieno", "phone": "+254700111222", "make": "Subaru",
            "model": "Outback", "year": "2015", "condition": "Good",
            "photos": [(self.jpeg(), "front.jpg"), (self.jpeg("red"), "back.jpg"), (io.BytesIO(b"<?php"), "x.php")],
        }, content_type="multipart/form-data")
        self.assertEqual(res.status_code, 201)
        inquiry_id = res.get_json()["id"]
        self.sign_in()
        html = self.client.get(f"/admin/inquiries/{inquiry_id}").get_data(as_text=True)
        self.assertIn("Customer photos (2)", html)
        photo = re.search(r'src="/(uploads/[^"]+)"', html).group(1)
        self.assertTrue((self.tmp / photo).exists())
        # Deleting the inquiry removes its photos too
        token = self.csrf(f"/admin/inquiries/{inquiry_id}")
        self.client.post(f"/admin/inquiries/{inquiry_id}/delete", data={"csrf_token": token})
        self.assertFalse((self.tmp / photo).exists())

    def test_sell_photo_limit_and_bad_files(self):
        too_many = [(self.jpeg(), f"{i}.jpg") for i in range(9)]
        res = self.client.post("/api/inquiries", data={"kind": "sell", "name": "A", "phone": "1", "photos": too_many},
                               content_type="multipart/form-data")
        self.assertEqual(res.status_code, 400)
        res = self.client.post("/api/inquiries", data={"kind": "sell", "name": "A", "phone": "1",
                                                       "photos": [(io.BytesIO(b"nope"), "a.jpg")]},
                               content_type="multipart/form-data")
        self.assertEqual(res.status_code, 400)

    def test_photos_ignored_for_other_forms(self):
        res = self.client.post("/api/inquiries", data={"kind": "contact", "name": "A", "phone": "1",
                                                       "photos": [(self.jpeg(), "a.jpg")]},
                               content_type="multipart/form-data")
        self.assertEqual(res.status_code, 201)
        self.assertEqual(list((self.tmp / "uploads").iterdir()), [])

    def test_newsletter_signup_dedupes_and_stays_out_of_inbox(self):
        for _ in range(2):
            res = self.client.post("/api/inquiries", json={"kind": "newsletter", "email": "Fan@Example.com"})
            self.assertEqual(res.status_code, 201)
        self.assertTrue(res.get_json().get("already"))
        self.assertEqual(self.client.post("/api/inquiries", json={"kind": "newsletter"}).status_code, 400)
        self.sign_in()
        self.assertNotIn("Fan@Example.com", self.client.get("/admin/inquiries").get_data(as_text=True))
        subs = self.client.get("/admin/inquiries?kind=newsletter").get_data(as_text=True)
        self.assertEqual(subs.count("Fan@Example.com</a>"), 1)

    def test_service_booking(self):
        res = self.client.post("/api/inquiries", json={
            "kind": "service", "name": "Wanjiku", "phone": "0711", "make": "Toyota", "model": "Prado",
            "services": "Brakes, Diagnostics", "preferred_date": "2026-11-20"})
        self.assertEqual(res.status_code, 201)

    def test_offer_price(self):
        cars = self.client.get("/api/vehicles").get_json()["vehicles"]
        offers = [c for c in cars if c["on_offer"]]
        self.assertTrue(offers)
        self.assertTrue(all(c["was_price"] > c["price"] for c in offers))
        self.sign_in()
        car = cars[0]
        token = self.csrf(f"/admin/vehicles/{car['id']}/edit")
        res = self.client.post(f"/admin/vehicles/{car['id']}/edit", data={
            "csrf_token": token, "make": car["make"], "model": car["model"], "year": car["year"],
            "price": car["price"], "was_price": car["price"] - 1, "status": "available"})
        self.assertEqual(res.status_code, 400)
        self.assertIn("higher than the current price", res.get_data(as_text=True))

    def test_sitemap_and_robots(self):
        xml = self.client.get("/sitemap.xml").get_data(as_text=True)
        self.assertIn("/vehicle?id=2023-lexus-lx-600", xml)
        self.assertIn("/sell</loc>", xml)
        self.assertIn("Sitemap: http://localhost/sitemap.xml", self.client.get("/robots.txt").get_data(as_text=True))

    def test_old_database_is_upgraded(self):
        old = self.tmp / "old.db"
        con = sqlite3.connect(old)
        con.executescript("""
            CREATE TABLE vehicles (id INTEGER PRIMARY KEY, slug TEXT, make TEXT, model TEXT, trim TEXT, year INTEGER,
              price INTEGER, mileage INTEGER, transmission TEXT, fuel TEXT, engine_cc INTEGER, body_type TEXT,
              condition TEXT, exterior_color TEXT, interior_color TEXT, drivetrain TEXT, description TEXT,
              features TEXT, images TEXT, status TEXT, featured INTEGER, created_at TEXT, updated_at TEXT);
            CREATE TABLE inquiries (id INTEGER PRIMARY KEY, kind TEXT, name TEXT, email TEXT, phone TEXT, subject TEXT,
              message TEXT, vehicle_id INTEGER, details TEXT, status TEXT DEFAULT 'new', created_at TEXT);
        """)
        con.close()
        create_app({"TESTING": True, "SECRET_KEY": "t", "DATABASE": str(old), "UPLOAD_FOLDER": str(self.tmp / "u2")})
        con = sqlite3.connect(old)
        self.assertIn("was_price", [r[1] for r in con.execute("PRAGMA table_info(vehicles)")])
        self.assertIn("photos", [r[1] for r in con.execute("PRAGMA table_info(inquiries)")])
        con.close()

    # ---------------------------------------------------- email alerts
    def test_no_email_when_not_configured(self):
        with mock.patch.dict(os.environ, {}, clear=False), mock.patch("smtplib.SMTP") as smtp:
            for k in ("DCD_SMTP_HOST", "DCD_SMTP_USER", "DCD_SMTP_PASSWORD"):
                os.environ.pop(k, None)
            self.client.post("/api/inquiries", json={"kind": "contact", "name": "A", "phone": "1"})
            smtp.assert_not_called()

    def test_email_alert_sent_when_configured(self):
        env = {"DCD_SMTP_HOST": "smtp.test", "DCD_SMTP_USER": "site@test.co", "DCD_SMTP_PASSWORD": "pw",
               "DCD_NOTIFY_EMAIL": "owner@test.co"}
        with mock.patch.dict(os.environ, env), mock.patch("smtplib.SMTP") as smtp, \
                mock.patch("threading.Thread") as thread:
            thread.side_effect = lambda target, daemon: mock.Mock(start=target)
            self.client.post("/api/inquiries", json={
                "kind": "test_drive", "name": "Amina", "email": "amina@test.co", "phone": "0711",
                "vehicle": "2023-lexus-lx-600", "preferred_date": "2026-12-01"})
            msg = smtp.return_value.__enter__.return_value.send_message.call_args[0][0]
            self.assertEqual(msg["To"], "owner@test.co")
            self.assertEqual(msg["Reply-To"], "amina@test.co")
            self.assertIn("New test drive request: Amina", msg["Subject"])
            body = msg.get_content()
            self.assertIn("2023 Lexus LX 600", body)
            self.assertIn("/admin/inquiries/", body)

    def test_newsletter_does_not_email(self):
        with mock.patch.object(notify, "notify_inquiry") as alert:
            self.client.post("/api/inquiries", json={"kind": "newsletter", "email": "x@y.co"})
            alert.assert_not_called()

    def test_admin_test_email_button(self):
        self.sign_in()
        for k in ("DCD_SMTP_HOST", "DCD_SMTP_USER", "DCD_SMTP_PASSWORD"):
            os.environ.pop(k, None)
        token = self.csrf("/admin/account")
        res = self.client.post("/admin/account/test-email", data={"csrf_token": token}, follow_redirects=True)
        self.assertIn("set up yet", res.get_data(as_text=True))


if __name__ == "__main__":
    unittest.main()
