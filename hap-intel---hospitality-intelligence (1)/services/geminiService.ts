import type { BusinessProfile } from "../types";

export const fetchBusinessProfile = async (
  name: string,
  location: string,
): Promise<BusinessProfile> => {
  try {
    const response = await fetch("/api/business-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessName: name, city: location }),
    });

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json().catch(() => undefined) : undefined;
    const text = !isJson ? await response.text().catch(() => "") : "";

    if (!response.ok) {
      const message =
        payload?.error ||
        payload?.message ||
        text ||
        `La investigación OSINT ha fallado (HTTP ${response.status}).`;
      throw new Error(message);
    }

    if (!payload) {
      throw new Error("Respuesta inválida del servidor.");
    }

    return payload as BusinessProfile;
  } catch (error: any) {
    console.error("Error fetching business profile:", error);
    throw new Error(
      error?.message ||
        "Error en la investigación OSINT. Verifica el nombre o intenta de nuevo.",
    );
  }
};
