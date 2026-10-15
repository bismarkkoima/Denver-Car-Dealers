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
fonts/              Self-hosted Google Fonts (Inter, Jost)
tests/              Automated tests: python -m unittest discover tests
```

Runtime data lives in `instance/` (database and secret key) and `uploads/` (photos added through the admin panel), or in `DCD_DATA_DIR` when that's set. It's kept out of git, so **back it up** on your server.

## Going live

The site needs a host that runs Python so the forms and admin panel work. Two good options:

### Option A: PythonAnywhere (free plan, data kept safe)

1. Create an account at [pythonanywhere.com](https://www.pythonanywhere.com) and open a **Bash console**.
2. Download the code and install it:
   ```bash
   git clone https://github.com/bismarkkoima/Denver-Car-Dealers.git
   cd Denver-Car-Dealers
   pip install --user -r requirements.txt
   ```
3. Go to the **Web** tab → *Add a new web app* → *Manual configuration* → the newest Python version.
4. On that page set **Source code** to `/home/YOURNAME/Denver-Car-Dealers`, then open the **WSGI configuration file** link and replace everything in it with:
   ```python
   import sys
   sys.path.insert(0, "/home/YOURNAME/Denver-Car-Dealers")
   from app import app as application
   ```
5. Click **Reload**, then visit `https://YOURNAME.pythonanywhere.com/admin` to create your admin login.

To publish later changes: open a Bash console, run `cd Denver-Car-Dealers && git pull`, then click **Reload** on the Web tab.

### Option B: Render (paid Starter plan, automatic deploys)

1. Create an account at [render.com](https://render.com) and connect your GitHub.
2. Click **New → Blueprint** and choose this repository. `render.yaml` sets everything up: the server, a secret key, and a 1 GB disk that keeps the database and photos safe.
3. Click **Apply**. When it's live, open `https://YOUR-APP.onrender.com/admin` to create your admin login.

Every push to `main` redeploys automatically. Render's free plan has no disk, so the database and uploaded photos would be wiped on every deploy. Use Starter or Option A.

### Settings

| Environment variable | Purpose |
| --- | --- |
| `DCD_DATA_DIR` | Folder for the database, secret key and uploaded photos (point it at a persistent disk) |
| `DCD_SECRET_KEY` | Long random string used to sign admin sessions (created automatically if not set) |
| `DCD_SECURE_COOKIES=1` | Only send the admin login cookie over HTTPS (set this once the site uses HTTPS) |

The production start command is in `Procfile`: `gunicorn app:app --workers 1 --threads 4`. Keep **one** worker: login lockouts and form rate limits are kept in memory.

### Before launch checklist

- [ ] Replace the placeholder email and phone in the `SITE` block of `js/main.js`
- [ ] Replace the 8 sample cars (made-up prices) with your real stock in `/admin`
- [ ] Update the social media links in `js/main.js`
- [ ] Back up the data folder (`instance/` and `uploads/`, or `DCD_DATA_DIR`) regularly
