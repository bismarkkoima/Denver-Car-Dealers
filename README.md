# Denver Car Dealership

Website and admin panel for Denver Car Dealership, Eldoret: *where value meets the road*.

- **Website:** Home, Vehicles (search and filters), Vehicle details, Financing (payment calculator and credit application), Test Drive, Contact, About
- **Admin panel** (`/admin`): manage inventory and photos, and read every message, test-drive request and finance application in one inbox

## Run it locally

You need Python 3.10 or newer.

```bash
pip install -r requirements.txt
python app.py
```

Open http://127.0.0.1:5000 for the website and http://127.0.0.1:5000/admin for the admin panel.
The first time you open `/admin` it asks you to create your admin username and password.

> Opening the HTML files directly (or with VS Code Live Server) still works: the
> inventory loads from `data/inventory.json`. The forms can't save anything
> without the server, so they offer the visitor a phone call or WhatsApp instead.

## Using the admin panel

| Page | What you can do |
| --- | --- |
| **Dashboard** | Stock counts, total stock value, newest inquiries |
| **Inventory** | Add, edit or delete cars; upload several photos and pick the cover; mark a car *Available*, *Reserved*, *Sold* or *Draft* (hidden from the website); feature cars on the home page |
| **Inquiries** | Contact messages, test-drive bookings and finance applications; filter by type and status; reply by email, phone or WhatsApp in one click; export everything to CSV |
| **Account** | Change your password |

Add another admin from the command line:

```bash
flask --app app create-admin NAME
```

Import many cars at once from a JSON or CSV file:

```bash
python admin/import-car.py my-cars.csv            # adds to the current inventory
python admin/import-car.py my-cars.json --replace # replaces the whole inventory
```

## Change contact details

Phone, WhatsApp, email, address, opening hours, social links and default finance rates are set in one place: the `SITE` object at the top of `js/main.js`. Every page reads them from there.

## Project layout

```
app.py              Web server, public API, page routing
database.py         SQLite storage (vehicles, inquiries, admins)
admin/              Admin panel (routes, templates, import script)
data/inventory.json Starting inventory, loaded into the database on first run
*.html              Website pages
css/style.css       Website design system
css/admin.css       Admin panel styles
js/main.js          Shared header, footer, menus, forms, inventory loader
js/*.js             Page-specific scripts
images/, videos/    Media (videos are web-optimised, with poster images)
tests/              Automated tests: python -m unittest discover tests
```

Runtime data lives in `instance/` (database and secret key) and `uploads/` (photos added through the admin panel). Both are kept out of git, so **back them up** on your server.

## Going live

Any host that runs Python works (Render, Railway, PythonAnywhere, a VPS…). Use a production server instead of `python app.py`, for example:

```bash
pip install gunicorn
gunicorn app:app
```

Recommended environment variables:

| Variable | Purpose |
| --- | --- |
| `DCD_SECRET_KEY` | Long random string used to sign admin sessions |
| `DCD_SECURE_COOKIES=1` | Only send the admin login cookie over HTTPS (set this once the site uses HTTPS) |
