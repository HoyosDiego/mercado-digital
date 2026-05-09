// services/geminiService.ts — Integración con Google Gemini API
// Analiza imágenes de productos y retorna campos sugeridos para el formulario

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface AnalyzedProductData {
  nombre: string;
  precio: number | null;
  categoria: "producto" | "servicio" | "arriendo";
  descripcion: string;
  tags: string[];
}

interface GeminiContent {
  parts: Array<{
    text?: string;
    inline_data?: {
      mime_type: string;
      data: string;
    };
  }>;
}

interface GeminiRequest {
  contents: GeminiContent[];
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
  };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

interface GeminiServiceInterface {
  analyzeProductImage: (imageFile: File) => Promise<AnalyzedProductData>;
}

// ─── Configuración ───────────────────────────────────────────────────────────
const USE_MOCK = true; // Cambiar a false para usar Gemini real
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-1.5-flash"; // Modelo con capacidad de visión

// ─── Prompt de análisis de producto ───────────────────────────────────────────
const ANALYSIS_PROMPT = `
Eres un asistente de digitalización para comerciantes locales en Colombia.
Analiza esta imagen de un producto, servicio o local y responde ÚNICAMENTE en JSON 
con la siguiente estructura (sin texto adicional):

{
  "nombre": "nombre del producto o servicio (máximo 50 caracteres)",
  "precio": número o null si no se puede estimar,
  "categoria": "producto" | "servicio" | "arriendo",
  "descripcion": "descripción breve y clara (máximo 120 caracteres)",
  "tags": ["etiqueta1", "etiqueta2"]
}

Si la imagen no es clara, usa tus mejores estimaciones.
Responde siempre en español colombiano, lenguaje sencillo.
`;

// ─── Utilidades ──────────────────────────────────────────────────────────────
function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Convertir File a string base64 (sin el prefijo data:...)
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extraer solo la parte base64, sin el encabezado "data:image/...;base64,"
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Error al leer la imagen"));
    reader.readAsDataURL(file);
  });
}

// ─── Servicio real de Gemini ────────────────────────────────────────────────
const geminiReal: GeminiServiceInterface = {
  analyzeProductImage: async (imageFile: File): Promise<AnalyzedProductData> => {
    // Convertir archivo a base64
    const base64 = await fileToBase64(imageFile);
    const mimeType = imageFile.type || "image/jpeg";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64,
                  },
                },
                { text: ANALYSIS_PROMPT },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3, // Baja temperatura para respuestas más precisas
            maxOutputTokens: 300,
          },
        } as GeminiRequest),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = (await response.json()) as GeminiResponse;
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error("Respuesta vacía de Gemini");
    }

    // Limpiar y parsear JSON de la respuesta
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned) as AnalyzedProductData;
  },
};

// ─── Mock del servicio (desarrollo sin API key) ──────────────────────────────
const mockResponses: AnalyzedProductData[] = [
  {
    nombre: "Empanadas de pipián",
    precio: 2500,
    categoria: "producto",
    descripcion: "Empanadas caseras rellenas de pipián, receta tradicional vallecaucana.",
    tags: ["comida", "tradicional", "snack"],
  },
  {
    nombre: "Corte de cabello caballero",
    precio: 15000,
    categoria: "servicio",
    descripcion: "Corte moderno con degradé, incluye lavado y secado.",
    tags: ["barbería", "peluquería", "estética"],
  },
  {
    nombre: "Local comercial calle 5",
    precio: 800000,
    categoria: "arriendo",
    descripcion: "Local de 20m² disponible, zona comercial, incluye vitrina.",
    tags: ["arriendo", "local", "comercio"],
  },
  {
    nombre: "Ropa deportiva talla M",
    precio: 45000,
    categoria: "producto",
    descripcion: "Conjunto deportivo licra y sudadera, varios colores disponibles.",
    tags: ["ropa", "deporte", "moda"],
  },
];

const geminiMock: GeminiServiceInterface = {
  analyzeProductImage: async (_imageFile: File): Promise<AnalyzedProductData> => {
    // Simular latencia de red y procesamiento de IA
    await simulateDelay(2200);

    // Simular fallo ocasional (10% de probabilidad) para probar manejo de errores
    if (Math.random() < 0.1) {
      throw new Error("Simulación de error de red");
    }

    // Retornar respuesta aleatoria del banco de mocks
    const randomIndex = Math.floor(Math.random() * mockResponses.length);
    return mockResponses[randomIndex];
  },
};

// ─── Exportar el servicio activo ───────────────────────────────────────────────
export const geminiService: GeminiServiceInterface = USE_MOCK ? geminiMock : geminiReal;
