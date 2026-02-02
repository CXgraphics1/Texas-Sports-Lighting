import { supabaseAdmin } from "./_utils/supabase.js";
import { requireAdmin } from "./_utils/auth.js";

export default async function handler(req, res) {
  const sb = supabaseAdmin();

  // ----------------------------
  // GET by slug (public: published only, admin: all)
  // ----------------------------
  if (req.method === "GET") {
    const slug = String(req.query?.slug || "").trim();
    if (!slug) return res.status(400).json({ ok: false, error: "Missing slug" });

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

  // Everything below is admin-only
  if (!requireAdmin(req)) {
    return res.status(401).json({ ok: false, error: "Not logged in." });
  }

  // ----------------------------
  // PUT update by id
  // /api/post?id=...
  // ----------------------------
  if (req.method === "PUT") {
    const id = String(req.query?.id || "").trim();
    if (!id) return res.status(400).json({ ok: false, error: "Missing id" });

    const body = req.body || {};
    const title = (body.title || "").trim();
    const slug = (body.slug || "").trim();
    const content = (body.content || "").trim();

    if (!title || !slug || !content) {
      return res.status(400).json({ ok: false, error: "Missing fields (title, slug, content)." });
    }

    const payload = {
      title,
      slug,
      excerpt: (body.excerpt || "").trim(),
      content,
      cover_image: (body.cover_image || "").trim() || null,
      published: body.published !== false,
      published_at: body.published_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await sb
      .from("posts")
      .update(payload)
      .eq("id", id)
      .select("id,title,slug,excerpt,cover_image,published,published_at,updated_at")
      .maybeSingle();

    if (error) return res.status(500).json({ ok: false, error: error.message });
    if (!data) return res.status(404).json({ ok: false, error: "Post not found" });

    return res.status(200).json({ ok: true, post: data });
  }

  // ----------------------------
  // DELETE by id
  // /api/post?id=...
  // ----------------------------
  if (req.method === "DELETE") {
    const id = String(req.query?.id || "").trim();
    if (!id) return res.status(400).json({ ok: false, error: "Missing id" });

    const { error } = await sb.from("posts").delete().eq("id", id);
    if (error) return res.status(500).json({ ok: false, error: error.message });

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
