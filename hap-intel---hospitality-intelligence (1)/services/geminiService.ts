import { GoogleGenAI, Type } from "@google/genai";
import { BusinessProfile } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Schema Definition
const businessProfileSchema = {
  type: Type.OBJECT,
  properties: {
    businessName: { type: Type.STRING },
    city: { type: Type.STRING },
    summary: { type: Type.STRING },
    score: { type: Type.NUMBER },
    metrics: {
      type: Type.OBJECT,
      properties: {
        reputation: { type: Type.NUMBER },
        visibility: { type: Type.NUMBER },
        quality: { type: Type.NUMBER },
        price: { type: Type.NUMBER }
      },
      required: ["reputation", "visibility", "quality", "price"]
    },
    attributes: {
      type: Type.OBJECT,
      properties: {
        terrace: { type: Type.BOOLEAN },
        reservations: { type: Type.BOOLEAN },
        cardType: { type: Type.STRING }
      },
      required: ["terrace", "reservations", "cardType"]
    },
    techStack: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING, enum: ["RESERVAS", "DELIVERY", "TPV", "PAGOS", "OTRO"] }
        }
      }
    },
    potentialIntegration: { type: Type.BOOLEAN },
    decisionMakers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          role: { type: Type.STRING },
          validation: { type: Type.STRING, enum: ["ALTO", "MEDIO", "BAJO"] },
          source: { type: Type.STRING }
        }
      }
    },
    deepAnalysis: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        sources: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["summary", "sources"]
    },
    contact: {
      type: Type.OBJECT,
      properties: {
        address: { type: Type.STRING },
        website: { type: Type.STRING },
        phone: { type: Type.STRING },
        phoneSource: { type: Type.STRING },
        uberEatsUrl: { type: Type.STRING, description: "URL directa del perfil de Uber Eats si existe" },
        domain: { type: Type.STRING },
        osintNotes: { type: Type.STRING }
      }
    },
    emailVectors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          email: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["INFERIDO", "VERIFICADO", "PÚBLICO"] },
          risk: { type: Type.STRING, enum: ["BAJO", "MEDIO", "ALTO"] }
        }
      }
    },
    outreach: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING }, 
          subject: { type: Type.STRING },
          body: { type: Type.STRING }
        },
        required: ["type", "subject", "body"] // ENFORCING REQUIRED FIELDS
      }
    },
    conversationStarters: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          context: { type: Type.STRING },
          date: { type: Type.STRING }
        }
      }
    },
    priceLevel: { type: Type.STRING },
    cuisineType: { type: Type.STRING }
  },
  required: ["businessName", "score", "decisionMakers", "outreach", "techStack", "conversationStarters"]
};

export const fetchBusinessProfile = async (name: string, location: string): Promise<BusinessProfile> => {
  try {
    const prompt = `
      Eres un analista de inteligencia comercial B2B experto en el sector HORECA (Hostelería) en España.
      
      TU OBJETIVO: Realizar una investigación OSINT profunda sobre "${name}" en "${location}" para preparar una venta de software TPV/Datáfono (Honei).

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
         SI NO TIENES DATOS EXACTOS, INVENTA UN PLACEHOLDER LÓGICO (ej. "[NOMBRE_RESPONSABLE]", "[NOMBRE_RESTAURANTE]").
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

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], 
        responseMimeType: "application/json",
        responseSchema: businessProfileSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data received from Gemini.");

    let data: BusinessProfile;
    try {
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        data = JSON.parse(cleanText);
    } catch (e) {
        throw new Error("Error parsing OSINT data.");
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks
      ?.map((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          return { title: chunk.web.title, uri: chunk.web.uri };
        }
        return null;
      })
      .filter((source: any) => source !== null) as { title: string; uri: string }[] || [];

    const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

    return {
      ...data,
      googleSearchSources: uniqueSources
    };

  } catch (error) {
    console.error("Error fetching business profile:", error);
    throw new Error("Error en la investigación OSINT. Verifica el nombre o intenta de nuevo.");
  }
};