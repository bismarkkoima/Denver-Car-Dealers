"""Uploaded photo handling, shared by the admin panel and the public "Sell your car" form."""
import uuid
from pathlib import Path

from flask import current_app
from PIL import Image, ImageOps, UnidentifiedImageError

ALLOWED_IMAGE_FORMATS = {"JPEG": ".jpg", "PNG": ".png", "WEBP": ".webp"}
MAX_IMAGE_SIDE = 2000


def save_upload(file_storage, max_side=MAX_IMAGE_SIDE):
    """Validate an uploaded photo, fix phone rotation, shrink it if huge and store it under /uploads.

    Re-saving drops the original metadata (including any GPS location). Returns the
    public path, or None when the file isn't a JPG, PNG or WEBP image.
    """
    try:
        img = Image.open(file_storage.stream)
        img.verify()
        file_storage.stream.seek(0)
        img = Image.open(file_storage.stream)
        ext = ALLOWED_IMAGE_FORMATS.get(img.format)
        if not ext:
            return None
        img = ImageOps.exif_transpose(img)
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        return None
    if img.mode not in ("RGB", "RGBA") or (ext == ".jpg" and img.mode != "RGB"):
        img = img.convert("RGBA" if ext != ".jpg" and "A" in img.getbands() else "RGB")
    img.thumbnail((max_side, max_side))
    name = f"{uuid.uuid4().hex}{ext}"
    img.save(Path(current_app.config["UPLOAD_FOLDER"]) / name, quality=85, optimize=True)
    return f"uploads/{name}"


def remove_upload(path):
    """Delete an uploaded file. Bundled site images are never touched."""
    if path.startswith("uploads/"):
        target = Path(current_app.config["UPLOAD_FOLDER"]) / Path(path).name
        target.unlink(missing_ok=True)
