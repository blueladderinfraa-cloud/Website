// Local file storage for development
// Saves files to the public directory and serves them via static file serving

import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";

const UPLOAD_DIR = path.join(process.cwd(), "client", "public", "uploads");

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function storageLocalPut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  await ensureUploadDir();
  
  const key = relKey.replace(/^\/+/, ""); // Remove leading slashes
  const filePath = path.join(UPLOAD_DIR, key);
  
  // Ensure subdirectories exist
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  
  // Write file
  if (typeof data === "string") {
    await fs.writeFile(filePath, data, "utf8");
  } else {
    await fs.writeFile(filePath, data);
  }
  
  // Return URL that can be served by the static file server
  const url = `/uploads/${key}`;
  
  return { key, url };
}

export async function storageLocalGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");
  const url = `/uploads/${key}`;
  
  return { key, url };
}