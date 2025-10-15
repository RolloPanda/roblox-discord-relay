// api/discord.js
export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") return new Response("Only POST", { status: 405 });

  const token = req.headers.get("x-game-token");
  if (!token || token !== process.env.GAME_WEBHOOK_TOKEN)
    return new Response("Unauthorized", { status: 401 });

  let body = {};
  try { body = await req.json(); } catch {}
  const { content, embeds, username, avatar_url } = body || {};
  if (!content && !embeds)
    return new Response(JSON.stringify({ error: "content atau embeds wajib" }), {
      status: 400, headers: { "Content-Type": "application/json" }
    });

  const payload = {
    content, embeds,
    username: username || "RobloxServer",
    avatar_url,
    allowed_mentions: { parse: [] }
  };

  const r = await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!r.ok) {
    const text = await r.text();
    return new Response(JSON.stringify({ error: "Discord error", status: r.status, body: text }), {
      status: 502, headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { "Content-Type": "application/json" }
  });
}
