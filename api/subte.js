import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const url = "https://www.buenosaires.gob.ar/subte";

    const html = await fetch(url).then(r => r.text());
    const $ = cheerio.load(html);

    const estados = {};

    $(".estado-linea").each((_, el) => {
      const nombre = $(el).find(".nombre").text().trim();
      const estado = $(el).find(".estado").text().trim();

      const letra = nombre.replace("Línea ", "");
      estados[letra] = estado.isNotEmpty ? estado : "Desconocido";
    });

    return res.status(200).json(estados);

  } catch (e) {
    return res.status(500).json({ error: "No se pudo scrapear el estado" });
  }
}
