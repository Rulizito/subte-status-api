import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const sources = [
      "https://api.fxtwitter.com/basubte",
      "https://api.vxtwitter.com/basubte",
    ];

    let json = null;

    for (const url of sources) {
      try {
        const r = await fetch(url);
        if (r.ok) {
          json = await r.json();
          break;
        }
      } catch (_) {}
    }

    if (!json || !json.tweets || json.tweets.length === 0) {
      return res.status(500).json({ error: "No se pudieron obtener tweets" });
    }

    const tweet = json.tweets[0]; // Último tweet real

    // Generar mapa de estados por línea basado en el texto del tweet
    const texto = tweet.text.toLowerCase();

    const lineas = ["A", "B", "C", "D", "E", "H"];
    const estados = {};

    for (const linea of lineas) {
      if (texto.includes(`${linea.toLowerCase()}:`) ||
          texto.includes(`línea ${linea.toLowerCase()}`)) {
        if (texto.contains("normal")) estados[linea] = "Normal";
        else if (texto.contains("demora")) estados[linea] = "Demoras";
        else if (texto.contains("interrump"))
          estados[linea] = "Interrumpido";
        else estados[linea] = "Estado no detectado";
      } else {
        estados[linea] = "Sin información";
      }
    }

    return res.status(200).json({
      fuente: "https://x.com/basubte",
      timestamp: tweet.created_at,
      tweet: tweet.text,
      lineas: estados,
    });

  } catch (e) {
    return res.status(500).json({ error: e.toString() });
  }
}
