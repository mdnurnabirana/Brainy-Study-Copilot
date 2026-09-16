import { createClient } from "@supabase/supabase-js";
import mongoose from "mongoose";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const task = process.argv[2];

if (!task || !["supabase", "mongodb"].includes(task)) {
  console.error("Usage: node keepalive.js <supabase|mongodb>");
  process.exit(1);
}

// ── Supabase keep-alive ─────────────────────────────────────────────
async function keepAliveSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }

  const supabase = createClient(url, key);
  const bucket = "pdfs";
  const storagePath = "keepalive/sample.pdf";
  const pdfPath = join(__dirname, "sample.pdf");
  const pdfBuffer = readFileSync(pdfPath);

  console.log("[supabase] Uploading sample.pdf ...");
  const { error: uploadErr } = await supabase.storage
    .from(bucket)
    .upload(storagePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`);
  console.log("[supabase] Upload OK");

  console.log("[supabase] Deleting sample.pdf ...");
  const { error: deleteErr } = await supabase.storage
    .from(bucket)
    .remove([storagePath]);

  if (deleteErr) throw new Error(`Delete failed: ${deleteErr.message}`);
  console.log("[supabase] Delete OK — done");
}

// ── MongoDB keep-alive ──────────────────────────────────────────────
async function keepAliveMongoDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI must be set");

  await mongoose.connect(uri);
  console.log("[mongodb] Connected");

  const db = mongoose.connection.db;
  const collection = db.collection("test");

  const doc = {
    keepAlive: true,
    timestamp: new Date(),
    message: "keep-alive ping",
  };

  const insertResult = await collection.insertOne(doc);
  console.log(`[mongodb] Inserted doc ${insertResult.insertedId}`);

  await collection.drop();
  console.log("[mongodb] Dropped 'test' collection — done");

  await mongoose.disconnect();
}

// ── Run ─────────────────────────────────────────────────────────────
const runners = { supabase: keepAliveSupabase, mongodb: keepAliveMongoDB };

runners[task]()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`[keepalive] ${task} failed:`, err.message);
    process.exit(1);
  });
