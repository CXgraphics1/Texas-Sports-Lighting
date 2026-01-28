import { supabaseAdmin } from "./_utils/supabase.js";
import { requireAdmin } from "./_utils/auth.js";

export const config = {
  api: { bodyParser: false } // we’ll read multipart ourselves
};

function sanitizeFileName(name = "upload") {
  return name.replace(/[^a-z0-9.\-_]/gi, "-").toLowerCase();
}

async function readMultipart(req) {
  // Tiny multipart parser (no deps). Works for one file field named "file".
  const contentType = req.headers["content-type"] || "";
  const match = contentType.match(/boundary=(.*)$/);
  if (!match) throw new Error("Missing multipart boundary");
  const boundary = `--${match[1]}`;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);

  const parts = buffer.toString("binary").split(boundary).slice(1, -1);
  if (!parts.length) throw new Error("No multipart parts");

  for (const part of parts) {
    const [rawHeaders, rawBody] = part.split("\r\n\r\n");
    if (!rawHeaders || !rawBody) continue;

    const headers = rawHeaders.toString();
    const fileNameMatch = headers.match(/filename="([^"]+)"/);
    const nameMatch = headers.match(/name="([^"]+)"/);

    if (!nameMatch) continue;
    const fieldName = nameMatch[1];

    // Body ends with \r\n
    const bodyBinary = rawBody.slice(0, rawBody.length - 2);

    if (fieldName === "file" && fileNameMatch) {
      const fileName = fileNameMatch[1];
      const fileBuf = Buffer.from(bodyBinary, "binary");
      return { fileName, fileBuf };
    }
  }

  throw new Error("File field not found");
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }
    if (!requireAdmin(req)) {
      return res.status(401).json({ ok: false, error: "Not logged in." });
    }

    const { fileName, fileBuf } = await readMultipart(req);

    const safeName = sanitizeFileName(fileName);
    const ext = safeName.split(".").pop();
    const path = `posts/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;

    const sb = supabaseAdmin();

    const { error } = await sb.storage
      .from("blog-images")
      .upload(path, fileBuf, {
        contentType: ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg",
        upsert: false
      });

    if (error) return res.status(500).json({ ok: false, error: error.message });

    const { data } = sb.storage.from("blog-images").getPublicUrl(path);
    return res.status(200).json({ ok: true, url: data.publicUrl });
  } catch (e) {
    return res.status(400).json({ ok: false, error: String(e.message || e) });
  }
}
