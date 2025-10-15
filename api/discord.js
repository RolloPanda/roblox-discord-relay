// api/discord.js
export const config = { runtime: "edge" };

export default async function handler(req) {
  // Izinkan hanya method POST
  if (req.method !== "POST") {
    return new Response("Only POST", { status: 405 });
  }

  // Ambil semua header, handle lowercase dan uppercase
  const headers = Object.fromEntries(req.headers);
  const token = headers["x-game-token"] || headers["X-Game-Token"];

  // Validasi token
  if (!token || token !== process.env.GAME_WEBHOOK_TOKEN) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Parsing body
  let body = {};
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Ambil field dari body
  const { content, embeds, username, avatar_url } = body || {};

  if (!content && !embeds) {
    return new Response(
      JSON.stringify({ error: "Field 'content' atau 'embeds' wajib diisi" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Siapkan payload untuk Discord
  const payload = {
    content,
    embeds,
    username: username || "RobloxServer",
    avatar_url,
    allowed_mentions: { parse: [] },
  };

  // Kirim ke Discord Webhook
  try {
    const res = await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(
        JSON.stringify({
          error: "Discord error",
          status: res.status,
          response: text,
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Sukses
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Gagal fetch ke Discord
    return new Response(
      JSON.stringify({ error: "Request failed", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
