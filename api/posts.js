import { supabaseAdmin } from "./_utils/supabase.js";
import { requireAdmin } from "./_utils/auth.js";

export default async function handler(req, res) {
  const sb = supabaseAdmin();

  // LIST POSTS
  // Public: published only
  // Admin: all
  // By default, we do NOT return full `content` (faster).
  // If you need it: /api/posts?include=content
  if (req.method === "GET") {
    const isAdmin = requireAdmin(req);
    const includeContent = String(req.query?.include || "").toLowerCase() === "content";

    const fields = [
      "id",
      "title",
      "slug",
      "excerpt",
      "cover_image",
      "published",
      "published_at",
      "updated_at",
    ];

    if (includeContent) fields.push("content");

    let q = sb
      .from("posts")
      .select(fields.join(","))
      .order("published_at", { ascending: false });

    if (!isAdmin) q = q.eq("published", true);

    const { data, error } = await q;

    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.status(200).json({ ok: true, posts: data || [] });
  }

  // CREATE POST (admin only)
  if (req.method === "POST") {
    if (!requireAdmin(req)) {
      return res.status(401).json({ ok: false, error: "Not logged in." });
    }

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
    };

    const { data, error } = await sb
      .from("posts")
      .insert([payload])
      .select("id,title,slug,excerpt,cover_image,published,published_at,updated_at")
      .single();

    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.status(200).json({ ok: true, post: data });
  }

  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
