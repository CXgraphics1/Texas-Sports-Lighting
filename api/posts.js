import { supabaseAdmin } from "./_utils/supabase.js";
import { requireAdmin } from "./_utils/auth.js";

export default async function handler(req, res) {
  if (!requireAdmin(req)) {
    return res.status(401).json({ ok: false, error: "Not logged in." });
  }

  const sb = supabaseAdmin();
  const id = req.query.id;

  if (!id) return res.status(400).json({ ok: false, error: "Missing id" });

  if (req.method === "PUT") {
    const { title, slug, excerpt, content, published, published_at } = req.body || {};
    const patch = {};
    if (title != null) patch.title = title;
    if (slug != null) patch.slug = slug;
    if (excerpt != null) patch.excerpt = excerpt;
    if (content != null) patch.content = content;
    if (published != null) patch.published = !!published;
    if (published_at != null) patch.published_at = published_at;

    const { data, error } = await sb
      .from("posts")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.status(200).json({ ok: true, post: data });
  }

  if (req.method === "DELETE") {
    const { error } = await sb.from("posts").delete().eq("id", id);
    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false });
}
