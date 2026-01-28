import { supabaseAdmin } from "./_utils/supabase.js";
import { requireAdmin } from "./_utils/auth.js";

export default async function handler(req, res) {
  const sb = supabaseAdmin();

  // LIST POSTS (public sees published only; admin sees all)
  if (req.method === "GET") {
    const isAdmin = requireAdmin(req);

    const q = sb
      .from("posts")
      .select("id,title,slug,excerpt,content,published,published_at,updated_at")
      .order("published_at", { ascending: false });

    const { data, error } = isAdmin ? await q : await q.eq("published", true);

    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.status(200).json({ ok: true, posts: data });
  }

  // CREATE POST (admin only) — NO ID REQUIRED
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

    const { data, error } = await sb
      .from("posts")
      .insert([{
        title,
        slug,
        excerpt: (body.excerpt || "").trim(),
        content,
        published: body.published !== false,
        published_at: body.published_at || new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.status(200).json({ ok: true, post: data });
  }

  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
