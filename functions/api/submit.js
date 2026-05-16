export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();

    const name = String(data.name || "").trim();
    const contact = String(data.contact || "").trim();
    const socialLinks = String(data.social || "").trim();
    const intro = String(data.intro || "").trim();
    const target = String(data.target || "").trim();

    if (!name || !contact) {
      return json({ error: "Name and contact are required." }, 400);
    }

    if (name.length > 100 || contact.length > 2000 || socialLinks.length > 3000 || intro.length > 1000 || target.length > 2000) {
      return json({ error: "Submitted content is too long." }, 400);
    }

    await env.DB.prepare(`
      INSERT INTO submissions
        (name, contact, social_links, intro, target)
      VALUES
        (?, ?, ?, ?, ?)
    `).bind(name, contact, socialLinks, intro, target).run();

    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ error: "Internal server error." }, 500);
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