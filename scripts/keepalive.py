#!/usr/bin/env python3
"""Keep-alive pings for Supabase Storage and MongoDB."""
import sys
import os
import subprocess
import uuid
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent


def _check_env(*names):
    for name in names:
        val = os.environ.get(name, "").strip()
        if not val:
            raise RuntimeError(
                f"Secret {name} is empty or not set.\n"
                f"Go to GitHub repo → Settings → Secrets → Actions and create it."
            )
        print(f"[env] {name} = set (len={len(val)})")
    return {name: os.environ[name].strip() for name in names}


# ── Supabase (via curl — most reliable for JWT auth) ────────────────
def keep_alive_supabase():
    env = _check_env("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY")
    url = env["SUPABASE_URL"].rstrip("/")
    key = env["SUPABASE_SERVICE_ROLE_KEY"]
    bucket = "pdfs"
    storage_path = f"keepalive/{uuid.uuid4().hex}.pdf"
    pdf_path = SCRIPT_DIR / "sample.pdf"

    # Upload via curl
    upload_url = f"{url}/storage/v1/object/{bucket}/{storage_path}"
    print(f"[supabase] Uploading to {upload_url} ...")
    result = subprocess.run(
        [
            "curl", "-s", "-w", "\n%{http_code}",
            "-X", "POST", upload_url,
            "-H", f"Authorization: Bearer {key}",
            "-H", "Content-Type: application/pdf",
            "-H", "x-upsert: true",
            "--data-binary", f"@{pdf_path}",
        ],
        capture_output=True, text=True, timeout=30,
    )
    lines = result.stdout.strip().rsplit("\n", 1)
    body, status = lines[0] if len(lines) > 1 else "", lines[-1] if lines else "000"
    print(f"[supabase] Upload response: {status} {body[:200]}")
    if status.startswith(("4", "5")):
        raise RuntimeError(f"Upload failed: {status} {body}")

    # Delete via curl
    delete_url = f"{url}/storage/v1/object/{bucket}/{storage_path}"
    print(f"[supabase] Deleting {storage_path} ...")
    result = subprocess.run(
        [
            "curl", "-s", "-w", "\n%{http_code}",
            "-X", "DELETE", delete_url,
            "-H", f"Authorization: Bearer {key}",
        ],
        capture_output=True, text=True, timeout=30,
    )
    lines = result.stdout.strip().rsplit("\n", 1)
    body, status = lines[0] if len(lines) > 1 else "", lines[-1] if lines else "000"
    print(f"[supabase] Delete response: {status} {body[:200]}")
    if status.startswith(("4", "5")):
        raise RuntimeError(f"Delete failed: {status} {body}")

    print("[supabase] Done")


# ── MongoDB ─────────────────────────────────────────────────────────
def keep_alive_mongodb():
    from pymongo import MongoClient
    from pymongo.errors import ConfigurationError, ServerSelectionTimeoutError

    uri = os.environ["MONGODB_URI"].strip()
    print(f"[mongodb] URI starts with: {uri[:20]}...")

    # Try connecting with SRV first, then with direct connection
    client = None
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=15000)
        # Force connection attempt
        client.admin.command("ping")
        print("[mongodb] Connected via SRV")
    except (ConfigurationError, ServerSelectionTimeoutError) as e:
        print(f"[mongodb] SRV connection failed: {e}")
        # Try converting srv to direct connection
        if "+srv" in uri:
            print("[mongodb] Trying direct DNS resolution...")
            import dns.resolver
            # Extract hostname from SRV URI
            # mongodb+srv://user:pass@HOSTNAME/db?params
            host_part = uri.split("@")[1].split("/")[0]
            try:
                answers = dns.resolver.resolve(f"_mongodb._tcp.{host_part}", "SRV")
                hosts = [(a.target.to_text().rstrip("."), a.port) for a in answers]
                direct_hosts = ",".join(f"{h}:{p}" for h, p in hosts)
                direct_uri = uri.replace("+srv", "").replace(host_part, direct_hosts)
                print(f"[mongodb] Resolved {len(hosts)} hosts, trying: {direct_hosts}")
                client = MongoClient(direct_uri, serverSelectionTimeoutMS=15000)
                client.admin.command("ping")
                print("[mongodb] Connected via direct connection")
            except Exception as e2:
                raise RuntimeError(
                    f"Cannot connect to MongoDB. SRV and direct both failed.\n"
                    f"SRV error: {e}\nDirect error: {e2}\n"
                    f"Check your MONGODB_URI secret in GitHub."
                ) from e2
        else:
            raise

    db = client.get_database("test")
    collection = db["test"]

    result = collection.insert_one({
        "keepAlive": True,
        "message": "keep-alive ping",
    })
    print(f"[mongodb] Inserted doc {result.inserted_id}")

    collection.drop()
    print("[mongodb] Dropped 'test' collection")
    client.close()
    print("[mongodb] Done")


if __name__ == "__main__":
    task = sys.argv[1] if len(sys.argv) > 1 else ""
    try:
        if task == "supabase":
            keep_alive_supabase()
        elif task == "mongodb":
            keep_alive_mongodb()
        else:
            print("Usage: python keepalive.py <supabase|mongodb>", file=sys.stderr)
            sys.exit(1)
    except Exception as e:
        print(f"\n[keepalive] FAILED: {e}", file=sys.stderr)
        sys.exit(1)
