import { supabaseAdmin } from "./_utils/supabase.js";
import { requireAdmin } from "./_utils/auth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const sb = supabaseAdmin();
  const slug = String(req.query?.slug || "").trim();

  if (!slug) {
    return res.status(400).json({ ok: false, error: "Missing slug" });
  }

  const isAdmin = requireAdmin(req);

  let q = sb
    .from("posts")
    .select("id,title,slug,excerpt,cover_image,content,published,published_at,updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (!isAdmin) q = q.eq("published", true);

  const { data, error } = await q;

  if (error) return res.status(500).json({ ok: false, error: error.message });
  if (!data) return res.status(404).json({ ok: false, error: "Post not found" });

  return res.status(200).json({ ok: true, post: data });
}
