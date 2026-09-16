#!/usr/bin/env python3
"""Keep-alive pings for Supabase Storage and MongoDB."""
import sys
import json
import os
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError

SCRIPT_DIR = Path(__file__).resolve().parent


def keep_alive_supabase():
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    bucket = "pdfs"
    storage_path = "keepalive/sample.pdf"
    pdf_bytes = (SCRIPT_DIR / "sample.pdf").read_bytes()

    # Upload
    upload_url = f"{url}/storage/v1/object/{bucket}/{storage_path}"
    req = Request(upload_url, data=pdf_bytes, method="POST")
    req.add_header("Authorization", f"Bearer {key}")
    req.add_header("Content-Type", "application/pdf")
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


def keep_alive_mongodb():
    from pymongo import MongoClient

    uri = os.environ["MONGODB_URI"]
    client = MongoClient(uri)
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
        print(f"Usage: python keepalive.py <supabase|mongodb>", file=sys.stderr)
        sys.exit(1)
