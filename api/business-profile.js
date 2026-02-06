function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
      if (body.length > 2_000_000) {
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

const businessProfileSchema = {
  type: "OBJECT",
  properties: {
    businessName: { type: "STRING" },
    city: { type: "STRING" },
    summary: { type: "STRING" },
    score: { type: "NUMBER" },
    metrics: {
      type: "OBJECT",
      properties: {
        reputation: { type: "NUMBER" },
        visibility: { type: "NUMBER" },
        quality: { type: "NUMBER" },
        price: { type: "NUMBER" },
      },
      required: ["reputation", "visibility", "quality", "price"],
    },
    attributes: {
      type: "OBJECT",
      properties: {
        terrace: { type: "BOOLEAN" },
        reservations: { type: "BOOLEAN" },
        cardType: { type: "STRING" },
      },
      required: ["terrace", "reservations", "cardType"],
    },
    techStack: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          category: {
            type: "STRING",
            enum: ["RESERVAS", "DELIVERY", "TPV", "PAGOS", "OTRO"],
          },
        },
      },
    },
    potentialIntegration: { type: "BOOLEAN" },
    decisionMakers: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          role: { type: "STRING" },
          validation: { type: "STRING", enum: ["ALTO", "MEDIO", "BAJO"] },
          source: { type: "STRING" },
        },
      },
    },
    deepAnalysis: {
      type: "OBJECT",
      properties: {
        summary: { type: "STRING" },
        sources: { type: "ARRAY", items: { type: "STRING" } },
      },
      required: ["summary", "sources"],
    },
    contact: {
      type: "OBJECT",
      properties: {
        address: { type: "STRING" },
        website: { type: "STRING" },
        phone: { type: "STRING" },
        phoneSource: { type: "STRING" },
        uberEatsUrl: {
          type: "STRING",
          description: "URL directa del perfil de Uber Eats si existe",
        },
        domain: { type: "STRING" },
        osintNotes: { type: "STRING" },
      },
    },
    emailVectors: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          email: { type: "STRING" },
          type: { type: "STRING", enum: ["INFERIDO", "VERIFICADO", "PÚBLICO"] },
          risk: { type: "STRING", enum: ["BAJO", "MEDIO", "ALTO"] },
        },
      },
    },
    outreach: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          type: { type: "STRING" },
          subject: { type: "STRING" },
          body: { type: "STRING" },
        },
        required: ["type", "subject", "body"],
      },
    },
    conversationStarters: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          headline: { type: "STRING" },
          context: { type: "STRING" },
          date: { type: "STRING" },
        },
      },
    },
    priceLevel: { type: "STRING" },
    cuisineType: { type: "STRING" },
  },
  required: [
    "businessName",
    "score",
    "decisionMakers",
    "outreach",
    "techStack",
    "conversationStarters",
  ],
};

function cleanJsonText(text) {
  if (!text) return "";
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

function uniqueSources(sources) {
  const map = new Map();
  for (const s of sources) {
    if (s && s.uri && !map.has(s.uri)) map.set(s.uri, s);
  }
  return Array.from(map.values());
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  try {
    const body = await readJsonBody(req);
    const businessName = body.businessName ?? body.name;
    const city = body.city ?? body.location;

    if (!businessName || !city) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "Missing businessName/city" }));
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      res.statusCode = 500;
      res.end(
        JSON.stringify({
          error:
            "Missing GEMINI_API_KEY (or API_KEY). Configure it in Vercel Project Settings → Environment Variables (Preview + Production).",
        }),
      );
      return;
    }

    const prompt = `
Eres un analista de inteligencia comercial B2B experto en el sector HORECA (Hostelería) en España.

TU OBJETIVO: Realizar una investigación OSINT profunda sobre \"${businessName}\" en \"${city}\" para preparar una venta de software TPV/Datáfono (Honei).

CRITERIO DE ACTUALIDAD:
- Prioriza SIEMPRE fuentes fechadas en 2024 y 2025.
- Si encuentras discrepancias entre fuentes, confía en la más reciente.

PASOS DE INVESTIGACIÓN:

1. **IDENTIFICACIÓN BÁSICA & DELIVERY:**
   - Busca web oficial, Google Maps y perfiles de delivery (especialmente **Uber Eats**).
   - Identifica Tech Stack: CoverManager, Uber Eats, Glovo, TPV (Micros, ICG, Ágora, etc).
   - Busca teléfono real.

2. **INVESTIGACIÓN CORPORATIVA (EL PROTOCOLO PERPLEXITY):**
   - Busca en LinkedIn, Informa D&B, BORME.
   - Objetivo: CFO, Dueño o Director de Operaciones.

3. **NOTICIAS (ICEBREAKERS):**
   - Busca noticias recientes, premios, aniversarios.

4. **VECTORES DE CONTACTO:**
   - Encuentra dominio web e infiere emails.

5. **GENERACIÓN DE OUTREACH (OBLIGATORIO):**
   Genera SIEMPRE un array con 5 emails de venta.
   SI NO TIENES DATOS EXACTOS, INVENTA UN PLACEHOLDER LÓGICO (ej. \"[NOMBRE_RESPONSABLE]\", \"[NOMBRE_RESTAURANTE]\").
   NO DEJES CAMPOS VACÍOS.

   **Variantes a generar:**
   1. **DIRECTO**: Enfoque en ahorro de tiempo y eliminación de errores manuales.
   2. **ROI**: Enfoque financiero, cálculo de ahorro anual (menciona 1200-2800€/mes).
   3. **CONSULTIVO**: Pregunta sobre gestión de propinas y cierres de caja.
   4. **ICEBREAKER**: Menciona algo positivo del local (su cocina, premios, reseñas) para conectar.
   5. **FOMO**: Menciona que competidores de la zona ya automatizan el cobro.

   **FORMATO EMAIL:**
   Usa saltos de línea (\\n\\n) para estructurar:
   Hola [Nombre],

   [Problema/Gancho]

   [Solución Honei]

   [CTA]

   [Despedida]

FORMATO DE SALIDA: JSON estricto cumpliendo el schema. Todo en Español.
`;

    const requestBody = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      tools: [{ googleSearch: {} }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: businessProfileSchema,
      },
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    let httpResponse;
    try {
      httpResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        },
      );
    } finally {
      clearTimeout(timeout);
    }

    const raw = await httpResponse.text();
    let json = {};
    try {
      json = raw ? JSON.parse(raw) : {};
    } catch {
      json = {};
    }

    if (!httpResponse.ok) {
      const message =
        json?.error?.message ||
        json?.error?.status ||
        raw ||
        `Gemini API error (HTTP ${httpResponse.status}).`;
      throw new Error(message);
    }

    const parts = json?.candidates?.[0]?.content?.parts ?? [];
    const modelText = cleanJsonText(parts.map((p) => p?.text ?? "").join(""));
    if (!modelText) throw new Error("No data received from Gemini.");

    let data;
    try {
      data = JSON.parse(modelText);
    } catch {
      const startIndex = modelText.indexOf("{");
      const endIndex = modelText.lastIndexOf("}");
      if (startIndex === -1 || endIndex === -1) {
        throw new Error("Error parsing OSINT data.");
      }
      data = JSON.parse(modelText.substring(startIndex, endIndex + 1));
    }

    const groundingChunks = json?.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = Array.isArray(groundingChunks)
      ? groundingChunks
          .map((chunk) => {
            const web = chunk?.web;
            if (web?.uri && web?.title) return { title: web.title, uri: web.uri };
            return null;
          })
          .filter(Boolean)
      : [];

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        ...data,
        googleSearchSources: uniqueSources(sources),
      }),
    );
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e?.message || "Internal Server Error" }));
  }
};
