import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const nitterInstances = [
      "https://nitter.net",
      "https://nitter.cz",
      "https://nitter.privacydev.net",
      "https://nitter.x86-64-unknown-linux-gnu.zip",
    ];

    let tweets = null;

    for (const base of nitterInstances) {
      try {
        const url = `${base}/basubte/rss`;
        const r = await fetch(url, { timeout: 7000 });

        if (r.ok) {
          const xml = await r.text();

          // Extraer contenido del primer <item>
          const match = xml.match(/<item>[\s\S]*?<title>(.*?)<\/title>/);
          const time = xml.match(/<pubDate>(.*?)<\/pubDate>/);

          if (match) {
            tweets = {
              text: match[1],
              timestamp: time ? time[1] : null,
            };
            break;
          }
        }
      } catch (_) {}
    }

    if (!tweets) {
      return res.status(500).json({ error: "No se pudieron obtener tweets de ninguna instancia Nitter" });
    }

    const texto = tweets.text.toLowerCase();

    const lineas = ["A", "B", "C", "D", "E", "H"];
    const estados = {};

    for (const linea of lineas) {
      if (texto.includes("normal")) estados[linea] = "Normal";
      else if (texto.includes("demora")) estados[linea] = "Demoras";
      else if (texto.includes("interrump")) estados[linea] = "Interrumpido";
      else estados[linea] = "Sin información";
    }

    return res.status(200).json({
      fuente: "https://x.com/basubte",
      timestamp: tweets.timestamp,
      tweet: tweets.text,
      lineas: estados,
    });

  } catch (e) {
    return res.status(500).json({ error: e.toString() });
  }
}
