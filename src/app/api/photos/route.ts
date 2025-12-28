import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public", "fotos");
const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

export async function GET() {
  try {
    const files = await readdir(PUBLIC_DIR, { withFileTypes: true });
    const photos = files
      .filter((f) => f.isFile())
      .filter((f) => ALLOWED.has(path.extname(f.name).toLowerCase()))
      .map((f) => ({
        src: `/fotos/${encodeURIComponent(f.name)}`,
        alt: f.name,
      }));
    return NextResponse.json({ photos });
  } catch (err) {
    console.error("/api/photos error", err);
    return NextResponse.json({ photos: [] }, { status: 500 });
  }
}
