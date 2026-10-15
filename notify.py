"""Email alerts for new inquiries.

Configure with environment variables (works with Gmail, Outlook, Zoho or any SMTP host):

    DCD_SMTP_HOST      e.g. smtp.gmail.com
    DCD_SMTP_PORT      587 (STARTTLS, default) or 465 (SSL)
    DCD_SMTP_USER      the email account that sends the alerts
    DCD_SMTP_PASSWORD  its password (for Gmail: an "App password")
    DCD_NOTIFY_EMAIL   where alerts go (comma-separate several); defaults to DCD_SMTP_USER

When these aren't set, alerts are simply skipped and inquiries still save normally.
"""
import logging
import os
import smtplib
import ssl
import threading
from email.message import EmailMessage

log = logging.getLogger(__name__)

KIND_TITLES = {
    "contact": "New message",
    "test_drive": "New test drive request",
    "finance": "New finance application",
    "sell": "New car offer request",
    "service": "New service booking",
    "newsletter": "New newsletter subscriber",
}


def settings():
    user = os.environ.get("DCD_SMTP_USER", "")
    return {
        "host": os.environ.get("DCD_SMTP_HOST", ""),
        "port": int(os.environ.get("DCD_SMTP_PORT", "587") or 587),
        "user": user,
        "password": os.environ.get("DCD_SMTP_PASSWORD", ""),
        "to": [a.strip() for a in os.environ.get("DCD_NOTIFY_EMAIL", user).split(",") if a.strip()],
    }


def is_configured():
    s = settings()
    return bool(s["host"] and s["user"] and s["password"] and s["to"])


def send(subject, body, reply_to=None):
    """Send one email synchronously. Raises on failure."""
    s = settings()
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = f"Denver Car Dealership website <{s['user']}>"
    msg["To"] = ", ".join(s["to"])
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.set_content(body)
    context = ssl.create_default_context()
    if s["port"] == 465:
        with smtplib.SMTP_SSL(s["host"], s["port"], context=context, timeout=20) as smtp:
            smtp.login(s["user"], s["password"])
            smtp.send_message(msg)
    else:
        with smtplib.SMTP(s["host"], s["port"], timeout=20) as smtp:
            smtp.starttls(context=context)
            smtp.login(s["user"], s["password"])
            smtp.send_message(msg)


def inquiry_email(inquiry, admin_url=""):
    """Subject and plain-text body describing an inquiry."""
    title = KIND_TITLES.get(inquiry["kind"], "New inquiry")
    lines = [f"{title} from {inquiry['name']}", ""]
    for label, key in (("Name", "name"), ("Phone", "phone"), ("Email", "email"),
                       ("Vehicle", "vehicle_title"), ("Subject", "subject")):
        if inquiry.get(key):
            lines.append(f"{label}: {inquiry[key]}")
    for key, value in (inquiry.get("details") or {}).items():
        lines.append(f"{key.replace('_', ' ').capitalize()}: {value}")
    if inquiry.get("photos"):
        lines.append(f"Photos: {len(inquiry['photos'])} attached in the admin panel")
    if inquiry.get("message"):
        lines += ["", "Message:", inquiry["message"]]
    if admin_url:
        lines += ["", f"Open in the admin panel: {admin_url}"]
    return f"{title}: {inquiry['name']}", "\n".join(lines)


def notify_inquiry(inquiry, admin_url=""):
    """Email the dealership about an inquiry in the background. Never raises."""
    if not is_configured():
        return

    subject, body = inquiry_email(inquiry, admin_url)

    def worker():
        try:
            send(subject, body, reply_to=inquiry.get("email") or None)
        except Exception:  # noqa: BLE001 - an email problem must never break a customer's form
            log.exception("Could not send inquiry alert email")

    threading.Thread(target=worker, daemon=True).start()
