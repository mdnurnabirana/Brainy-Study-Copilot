#!/usr/bin/env python3
"""Keep-alive pings for Supabase Storage and MongoDB."""
import sys
import os
import uuid
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError

SCRIPT_DIR = Path(__file__).resolve().parent

# ── Supabase ────────────────────────────────────────────────────────
def keep_alive_supabase():
    url = os.environ["SUPABASE_URL"].rstrip("/")
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    bucket = "pdfs"
    storage_path = f"keepalive/{uuid.uuid4().hex}.pdf"
    pdf_bytes = (SCRIPT_DIR / "sample.pdf").read_bytes()

    boundary = uuid.uuid4().hex
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="sample.pdf"\r\n'
        f"Content-Type: application/pdf\r\n\r\n"
    ).encode() + pdf_bytes + f"\r\n--{boundary}--\r\n".encode()

    # Upload
    upload_url = f"{url}/storage/v1/object/{bucket}/{storage_path}"
    req = Request(upload_url, data=body, method="POST")
    req.add_header("Authorization", f"Bearer {key}")
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    req.add_header("x-upsert", "true")
    try:
        resp = urlopen(req)
        print("[supabase] Upload OK:", resp.read().decode())
    except HTTPError as e:
        raise RuntimeError(f"Upload failed: {e.code} {e.read().decode()}")

    # Delete
    delete_url = f"{url}/storage/v1/object/{bucket}/{storage_path}"
    req = Request(delete_url, method="DELETE")
    req.add_header("Authorization", f"Bearer {key}")
    try:
        resp = urlopen(req)
        print("[supabase] Delete OK:", resp.read().decode())
    except HTTPError as e:
        raise RuntimeError(f"Delete failed: {e.code} {e.read().decode()}")


# ── MongoDB ─────────────────────────────────────────────────────────
def keep_alive_mongodb():
    from pymongo import MongoClient

    uri = os.environ["MONGODB_URI"]
    client = MongoClient(uri, serverSelectionTimeoutMS=10000)
    db = client.get_database()
    collection = db["test"]

    result = collection.insert_one({
        "keepAlive": True,
        "message": "keep-alive ping",
    })
    print(f"[mongodb] Inserted doc {result.inserted_id}")

    collection.drop()
    print("[mongodb] Dropped 'test' collection")
    client.close()


if __name__ == "__main__":
    task = sys.argv[1] if len(sys.argv) > 1 else ""
    if task == "supabase":
        keep_alive_supabase()
    elif task == "mongodb":
        keep_alive_mongodb()
    else:
        print("Usage: python keepalive.py <supabase|mongodb>", file=sys.stderr)
        sys.exit(1)
