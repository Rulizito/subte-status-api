import fetch from "node-fetch";
import * as cheerio from "cheerio";

/*
  FUENTE PRINCIPAL:
  - https://x.com/basubte

  Objetivo:
  - Scrappear el tweet más reciente
  - Extraer el estado de cada línea
  - Devolver JSON estandarizado
*/

export default async function handler(req, res) {
  try {
    // 1) Cargar HTML de la página de BA Subte
    const url = "https://nitter.net/basubte"; // espejo rápido sin login
    const html = await fetch(url).then((r) => r.text());

    const $ = cheerio.load(html);

    // 2) Encontrar el tweet más reciente
    const firstTweet = $(".timeline-item .tweet-content").first().text();

    if (!firstTweet) {
      return res.status(500).json({ error: "Error leyendo tweets" });
    }

    // 3) Extraer estado mediante expresiones regulares
    const lines = ["A", "B", "C", "D", "E", "H"];
    const status = {};

    for (const line of lines) {
      const regex = new RegExp(`L[ií]nea\\s*${line}.*?(Normal|Demoras|Interrumpida|Limitado|Suspendida)`, "i");

      const match = firstTweet.match(regex);

      status[line] = match ? match[1] : "Desconocido";
    }

    // 4) Respuesta final normalizada
    return res.status(200).json({
      fuente: "https://x.com/basubte",
      timestamp: new Date().toISOString(),
      tweet: firstTweet.trim(),
      lineas: status
    });

  } catch (e) {
    return res.status(500).json({
      error: e.message,
    });
  }
}
