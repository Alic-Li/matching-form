export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    if (!env?.DB) {
      return json({
        error: "Database binding `DB` is not configured."
      }, 500);
    }

    const data = await request.json();

    const name = String(data.name || "").trim();
    const birthday = String(data.birthday || "").trim();
    const contact = String(data.contact || "").trim();
    const socialLinks = String(data.social || "").trim();
    const intro = String(data.intro || "").trim();
    const target = String(data.target || "").trim();
    const overwrite = Boolean(data.overwrite);

    if (!name || !birthday || !contact) {
      return json({ error: "Name, birthday and contact are required." }, 400);
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
      return json({ error: "Invalid birthday format." }, 400);
    }

    const existing = await env.DB.prepare(
      "SELECT id, name, birthday FROM submissions WHERE name = ? AND birthday = ?"
    ).bind(name, birthday).first();

    if (existing && !overwrite) {
      return json({
        error: "A submission with this name and birthday already exists.",
        code: "DUPLICATE_NAME_BIRTHDAY"
      }, 409);
    }

    if (existing && overwrite) {
      await env.DB.prepare(`
        UPDATE submissions
        SET birthday = ?,
            contact = ?,
            social_links = ?,
            intro = ?,
            target = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE name = ? AND birthday = ?
      `).bind(birthday, contact, socialLinks, intro, target, name, birthday).run();

      return json({ ok: true, overwritten: true });
    }

    await env.DB.prepare(`
      INSERT INTO submissions
        (name, birthday, contact, social_links, intro, target)
      VALUES
        (?, ?, ?, ?, ?, ?)
    `).bind(name, birthday, contact, socialLinks, intro, target).run();

    return json({ ok: true, overwritten: false });
  } catch (err) {
    console.error(err);
    return json({
      error: "Internal server error.",
      details: err instanceof Error ? err.message : String(err)
    }, 500);
  }
}

export async function onRequestGet() {
  return json({ error: "Method not allowed." }, 405);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
