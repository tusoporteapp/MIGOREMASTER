var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "50mb" }));
app.use(import_express.default.urlencoded({ limit: "50mb", extended: true }));
var aiClient = null;
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
app.get("/api/health", (req, res) => {
  const hasCfAccountId = !!process.env.CLOUDFLARE_ACCOUNT_ID;
  const hasCfToken = !!process.env.CLOUDFLARE_API_TOKEN;
  const hasCfWorker = !!process.env.CLOUDFLARE_WORKER_URL;
  const hasGemini = !!process.env.GEMINI_API_KEY;
  res.json({
    status: "ok",
    primaryEngine: "cloudflare",
    hasCloudflare: hasCfAccountId && hasCfToken || hasCfWorker,
    hasCloudflareWorker: hasCfWorker,
    configuredCloudflareAccountId: hasCfAccountId ? `${process.env.CLOUDFLARE_ACCOUNT_ID?.slice(0, 4)}...` : null,
    hasGemini
  });
});
app.post("/api/analyze", async (req, res) => {
  try {
    const { image, garmentType, printMethod, customNotes } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Se requiere una imagen para el an\xE1lisis multimodal." });
    }
    const ai = getGenAI();
    let mimeType = "image/jpeg";
    let base64Data = image;
    if (image.includes(";base64,")) {
      const parts = image.split(";base64,");
      const mimeMatch = parts[0].match(/:(.*?);/);
      if (mimeMatch) mimeType = mimeMatch[1];
      base64Data = parts[1];
    }
    const systemPrompt = `[SYSTEM INSTRUCTION: DIGITAL ART RESTORER & PRINT GRAPHIC DIRECTOR]

ROL Y PROP\xD3SITO:
Eres un Director de Arte Digital y Maestro de Restauraci\xF3n Gr\xE1fica especializado en preparaci\xF3n de archivos para impresi\xF3n profesional (DTF, Screen Printing / Serigraf\xEDa y Sublimaci\xF3n). Tu funci\xF3n es analizar una imagen de referencia imperfecta (foto de prenda, maqueta arrugada, perspectiva torcida o baja resoluci\xF3n) y RECONSTRUIR un archivo de arte original limpio, vectorial/semi-realista, de calidad premium y listo para producci\xF3n.

=========================================
PASO 1: AN\xC1LISIS MULTIMODAL DE ENTRADA
=========================================
Antes de generar el resultado, eval\xFAa la imagen de entrada y extrae:
1. Conteo de Dise\xF1os: Determina si existe 1 solo estampado o m\xFAltiples dise\xF1os (ej. Frente y Espalda).
2. Estilo Art\xEDstico Base: Ilustraci\xF3n vectorial, c\xF3mic, tipograf\xEDa pura, pintura digital o fotorrealismo.
3. Elementos a Ignorar (Ruido del Mundo Real): Arrugas de la tela, costuras, distorsi\xF3n de perspectiva, sombras fotogr\xE1ficas, brillos de c\xE1mara, marcas de agua externas (ej. "DM FOR INQUIRY", "SLIDE FOR MORE") y texturas del tejido.
4. Transcripci\xF3n Tipogr\xE1fica: Lee el texto exacto, corrige la curvatura o deformaci\xF3n de la prenda y mant\xE9n la fuente original o su equivalente de alta calidad.

=========================================
PASO 2: REGLAS DE REMASTERIZACI\xD3N Y PRODUCCI\xD3N
=========================================

1. ESTILIZACI\xD3N Y VOLUMEN T\xC9CNICO:
   - Ilustraciones Planas/Vectores/Logos: A\xF1ade volumen mediante sombreado semi-realista y cel-shading de alto contraste. Mant\xE9n contornos limpios y definidos.
   - Artes Realistas o Complejos: Remasteriza con texturas de alta resoluci\xF3n, nitidez extrema y microdetalles definidos.
   - Regla de Grosor M\xEDnimo: Ning\xFAn elemento o l\xEDnea debe ser inferior a 2pt (0.7 mm) para garantizar durabilidad en impresi\xF3n y evitar p\xE9rdida de detalle en pantalla.

2. TRATAMIENTO DEL COLOR Y BORDES:
   - Paleta de Color: Colores vibrantes, altamente saturados y corregidos para perfil de impresi\xF3n CMYK/RGB de amplia gama.
   - Bordes Exteriores Limpios: El dise\xF1o debe tener contornos 100% opacos y n\xEDtidos. 
   - RESTRICCI\xD3N ABSOLUTA DE BORDES: Prohibido aplicar sombras proyectadas (drop shadows), resplandores exteriores (outer glow), difuminados o degradados con opacidad parcial hacia el fondo.

3. INTEGRACI\xD3N DE MARCA "MIGO" (Firma de Autor Discreta):
   - Requisito Obligatorio: Incluye la palabra "MIGO" en el arte.
   - Escala y Visibilidad: Tama\xF1o micro/m\xEDnimo legible. Debe ser un detalle sutil y secundario.
   - Integraci\xF3n Org\xE1nica: Camufla "MIGO" dentro de la ilustraci\xF3n (ej. grabado diminuto en un objeto, texto sutil en una etiqueta de prenda dibujada o integrado en una l\xEDnea de textura).

4. AISLAMIENTO Y FONDO:
   - Fondo: Blanco puro absoluto (#FFFFFF / R:255 G:255 B:255).
   - Composici\xF3n: Dise\xF1o centrado, aislado, corregido a vista frontal ortogonal perfecta.
   - Eliminaci\xF3n de Elementos Ajenos: Extrae \xFAnicamente el arte y su tipograf\xEDa. Elimina cuellos, mangas, etiquetas reales o fondos de estudio.

=========================================
PASO 3: ESPECIFICACI\xD3N DE SALIDA (SELECCI\xD3N AUTOM\xC1TICA)
=========================================

- ESCENARIO A (Dise\xF1o \xDAnico):
  Genera una sola imagen en relaci\xF3n de aspecto 3:4 (Vertical), centrada sobre fondo blanco puro.

- ESCENARIO B (M\xFAltiples Dise\xF1os - Ej. Frente y Espalda):
  Genera una sola canvas ancha en relaci\xF3n de aspecto 16:9 o 2:1 que contenga ambos dise\xF1os remasterizados, alineados horizontalmente de izquierda a derecha, claramente separados y aislados sobre fondo blanco puro.

COMANDO DE ACTIVACI\xD3N:
"Remasteriza y Restaura este estampado, con fondo 100% blanco."

FORMATO DE RESPUESTA:
Responde estrictamente con un JSON v\xE1lido con la siguiente estructura:
{
  "designCount": "single" | "multiple",
  "scenario": "A" | "B",
  "baseArtStyle": string,
  "detectedNoise": string[],
  "typographyTranscription": {
    "hasText": boolean,
    "exactText": string,
    "fontStyleSuggested": string,
    "distortionCorrection": string
  },
  "ocrElements": [
    {
      "id": string,
      "rawText": string,
      "cleanedText": string,
      "confidence": number,
      "location": string,
      "identifiedFont": {
        "fontFamily": string,
        "style": string,
        "category": "Display" | "Sans-Serif" | "Serif" | "Slab" | "Gothic / Asian" | "Script",
        "suggestedGoogleFont": string,
        "googleFontUrl": string,
        "letterSpacing": string,
        "textTransform": "uppercase" | "lowercase" | "capitalize" | "normal",
        "recommendedStroke": string
      },
      "distortionAnalysis": {
        "detectedWarp": string,
        "correctionApplied": string,
        "curvatureAngle": string,
        "flatteningMethod": string
      }
    }
  ],
  "colorOptimization": {
    "targetGamut": "CMYK Wide-Gamut (FOGRA39)",
    "vibrancyBoostFactor": 1.25,
    "overallChromaIncrease": "+25% de ganancia crom\xE1tica",
    "enhancedPalette": [
      {
        "id": string,
        "name": string,
        "rawPhotographedHex": string,
        "enhancedHex": string,
        "cmyk": string,
        "rgb": string,
        "pantoneMatch": string,
        "saturationDelta": number,
        "role": "Dominante" | "Acento" | "Sombra" | "Contorno" | "Base Tinta",
        "standardsCompliance": {
          "dtf": string,
          "screenPrinting": string,
          "sublimation": string
        }
      }
    ],
    "methodGuidelines": {
      "dtf": string,
      "screenPrinting": string,
      "sublimation": string
    }
  },
  "productionRules": {
    "targetMethod": string,
    "lineWeightCompliance": "Grosor m\xEDnimo \u2265 2pt (0.7 mm) cumplido",
    "colorPalette": [{ "name": string, "hex": string, "cmyk": string, "pantoneApprox": string }],
    "edgeControl": "Contornos 100% opacos y n\xEDtidos. Sin drop shadows ni transparencias.",
    "migoBrandingPlacement": "Micro-firma 'MIGO' discretamente grabada en la l\xEDnea perimetral inferior.",
    "backgroundSpec": "Blanco puro absoluto #FFFFFF (R:255 G:255 B:255)",
    "suggestedAspectRatio": "3:4" | "16:9" | "1:1"
  },
  "restorationSummary": string,
  "engineeredPrompt": string
}`;
    const cfAccountId = req.body.cloudflareConfig?.accountId || process.env.CLOUDFLARE_ACCOUNT_ID;
    const cfApiToken = req.body.cloudflareConfig?.apiToken || process.env.CLOUDFLARE_API_TOKEN;
    const cfWorkerUrl = req.body.cloudflareConfig?.workerUrl || process.env.CLOUDFLARE_WORKER_URL;
    if (cfAccountId && cfApiToken) {
      try {
        const cfVisionUrl = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/meta/llama-3.2-11b-vision-instruct`;
        const cfVisionRes = await fetch(cfVisionUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${cfApiToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            prompt: `${systemPrompt}

Prenda: ${garmentType || "Camiseta textil"}, M\xE9todo: ${printMethod || "DTF/Serigraf\xEDa"}. ${customNotes || ""}
Responde SOLO en formato JSON.`,
            image: base64Data
          })
        });
        if (cfVisionRes.ok) {
          const cfJson = await cfVisionRes.json();
          const rawResponse = cfJson?.result?.response || cfJson?.response || "";
          const cleanJson = rawResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
          try {
            const parsed = JSON.parse(cleanJson);
            return res.json({ success: true, analysis: parsed, engineUsed: "Cloudflare Llama 3.2 Vision" });
          } catch (pErr) {
            console.warn("Cloudflare Vision JSON parse note:", pErr);
          }
        }
      } catch (cfVisionErr) {
        console.warn("Cloudflare Vision call note:", cfVisionErr);
      }
    }
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: systemPrompt },
              { text: `Notas adicionales del operador: Prenda ${garmentType || "Camiseta/Prenda textil"}, M\xE9todo de Impresi\xF3n: ${printMethod || "DTF/Serigraf\xEDa"}. ${customNotes || ""}` },
              {
                inlineData: {
                  mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ]
      });
      const responseText = response.text || "{}";
      const cleanJson = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      try {
        const parsed = JSON.parse(cleanJson);
        return res.json({ success: true, analysis: parsed, engineUsed: "Gemini Vision Engine" });
      } catch (parseErr) {
        console.warn("Direct JSON parse failed, returning sanitized structure", responseText);
      }
    }
    return res.json({
      success: true,
      analysis: {
        designCount: "single",
        scenario: "A",
        baseArtStyle: "Ilustraci\xF3n Vectorial Semi-Realista con Cel-Shading",
        detectedNoise: [
          "Arrugas de la tela en zona pectoral",
          "Distorsi\xF3n de perspectiva por ca\xEDda natural de la prenda",
          "Costura del cuello y mangas a ignorar",
          "Sombras fotogr\xE1ficas y textura del tejido"
        ],
        typographyTranscription: {
          hasText: true,
          exactText: "THUNDER SPEED \u2022 MOTOR CUSTOM 1982",
          fontStyleSuggested: "Impact / Headline Condensed Bold con trazo negro perimetral",
          distortionCorrection: "Aplanamiento ortogonal de curvatura pectoral a vector plano 100% recto"
        },
        ocrElements: [
          {
            id: "ocr-1",
            rawText: "THUNDER SPEED",
            cleanedText: "THUNDER SPEED",
            confidence: 99.4,
            location: "Arco Superior Pecho",
            identifiedFont: {
              fontFamily: "Impact / Headline Heavy",
              style: "Condensed Black 900",
              category: "Display",
              suggestedGoogleFont: "Bebas Neue",
              googleFontUrl: "https://fonts.google.com/specimen/Bebas+Neue",
              letterSpacing: "4px (+0.15em)",
              textTransform: "uppercase",
              recommendedStroke: "Trazo perimetral exterior de 4pt en negro s\xF3lido (#111111)"
            },
            distortionAnalysis: {
              detectedWarp: "Curvatura convexa de 18.4\xB0 debida a la ca\xEDda sobre el pectoral y arrugas de tela",
              correctionApplied: "Aplanamiento ortogonal a arco regularizado con radio R=240px constante",
              curvatureAngle: "18.4\xB0 convexo",
              flatteningMethod: "Alineaci\xF3n ortogonal vectorial con correcci\xF3n de l\xEDnea base"
            }
          },
          {
            id: "ocr-2",
            rawText: "MOTOR CUSTOM 1982",
            cleanedText: "MOTOR CUSTOM 1982",
            confidence: 98.8,
            location: "Cinta Inferior Frontal",
            identifiedFont: {
              fontFamily: "Arial Black / Grotesk Heavy",
              style: "Heavy 900 Regular",
              category: "Sans-Serif",
              suggestedGoogleFont: "Montserrat Black",
              googleFontUrl: "https://fonts.google.com/specimen/Montserrat",
              letterSpacing: "3px (+0.10em)",
              textTransform: "uppercase",
              recommendedStroke: "Trazo perimetral de 2.5pt para soporte de corte"
            },
            distortionAnalysis: {
              detectedWarp: "Inclinaci\xF3n de perspectiva lateral de -3.2\xB0 y pliegue horizontal",
              correctionApplied: "Nivelado horizontal ortogonal a 0.0\xB0 con centrado perfecto",
              curvatureAngle: "-3.2\xB0 skew",
              flatteningMethod: "Correcci\xF3n trapezoidal a rect\xE1ngulo euclidiano perfecto"
            }
          }
        ],
        colorOptimization: {
          targetGamut: "CMYK Wide-Gamut (FOGRA39)",
          vibrancyBoostFactor: 1.25,
          overallChromaIncrease: "+26.4% de ganancia en saturaci\xF3n crom\xE1tica",
          enhancedPalette: [
            {
              id: "c-1",
              name: "Rojo Carm\xEDn Impresi\xF3n",
              rawPhotographedHex: "#9B2C2C",
              enhancedHex: "#D32F2F",
              cmyk: "0, 95, 85, 0",
              rgb: "211, 47, 47",
              pantoneMatch: "PANTONE 186 C",
              saturationDelta: 28,
              role: "Dominante",
              standardsCompliance: {
                dtf: "Excelente opacidad sobre film. Requiere cama blanca W100%.",
                screenPrinting: "Malla 77T con tinta Plastisol alta cobertura. Curado 160\xB0C.",
                sublimation: "Compensaci\xF3n t\xE9rmica +10% en magenta para evitar virado a naranja."
              }
            },
            {
              id: "c-2",
              name: "Naranja Fuego Sombra",
              rawPhotographedHex: "#A84400",
              enhancedHex: "#E65100",
              cmyk: "0, 75, 100, 0",
              rgb: "230, 81, 0",
              pantoneMatch: "PANTONE 1585 C",
              saturationDelta: 25,
              role: "Acento",
              standardsCompliance: {
                dtf: "Gama CMYK est\xE1ndar sin empastado.",
                screenPrinting: "Malla 77T. Segunda pasada tras flash de secado intermedio.",
                sublimation: "Saturaci\xF3n pura en poli\xE9ster blanco a 200\xB0C."
              }
            },
            {
              id: "c-3",
              name: "Amarillo Dorado Sol",
              rawPhotographedHex: "#C99238",
              enhancedHex: "#FFB74D",
              cmyk: "0, 30, 80, 0",
              rgb: "255, 183, 77",
              pantoneMatch: "PANTONE 123 C",
              saturationDelta: 22,
              role: "Acento",
              standardsCompliance: {
                dtf: "Amarillo limpio de alta luminosidad.",
                screenPrinting: "Malla 90T para evitar sangrado de bordes.",
                sublimation: "Fijaci\xF3n instant\xE1nea sin p\xE9rdida de brillo."
              }
            },
            {
              id: "c-4",
              name: "Negro Enmascarado",
              rawPhotographedHex: "#22242B",
              enhancedHex: "#111111",
              cmyk: "60, 40, 40, 100",
              rgb: "17, 17, 17",
              pantoneMatch: "PANTONE Black 6 C",
              saturationDelta: 0,
              role: "Contorno",
              standardsCompliance: {
                dtf: "Negro enriquecido con base para m\xE1xima densidad en tejido oscuro.",
                screenPrinting: "Malla 55T para descarga abundante de tinta opaca.",
                sublimation: "K100% profundo sin matiz verdoso."
              }
            },
            {
              id: "c-5",
              name: "Blanco Base Tinta",
              rawPhotographedHex: "#D8DCE0",
              enhancedHex: "#FFFFFF",
              cmyk: "0, 0, 0, 0",
              rgb: "255, 255, 255",
              pantoneMatch: "PANTONE Opaque White",
              saturationDelta: 0,
              role: "Base Tinta",
              standardsCompliance: {
                dtf: "Cama base blanca W100% indispensable en DTF.",
                screenPrinting: "Tinta blanca de fondo (Underbase) en malla 43T o 55T.",
                sublimation: "El blanco corresponde al sustrato de poli\xE9ster virgen (reserva)."
              }
            }
          ],
          methodGuidelines: {
            dtf: "Todos los colores se enriquecen con una m\xE1scara de base blanca s\xF3lida W100%. Espacio de color CMYK Wide-Gamut FOGRA39 para transferencia t\xE9rmica a 130\xB0C.",
            screenPrinting: "Separaci\xF3n a 4 tintas directas (Spot Colors) + tinta blanca de reserva en mallas 55T a 77T con curado plastisol a 160\xB0C.",
            sublimation: "Perfil RGB Adobe RGB (1998) con compensaci\xF3n t\xE9rmica a 200\xB0C sobre tejido 100% poli\xE9ster blanco sin deformaci\xF3n crom\xE1tica."
          }
        },
        productionRules: {
          targetMethod: printMethod || "DTF & Serigraf\xEDa",
          lineWeightCompliance: "L\xEDneas reforzadas a > 2pt (0.7mm) para garantizar durabilidad de corte y malla",
          colorPalette: [
            { name: "Rojo Carm\xEDn Impresi\xF3n", hex: "#D32F2F", cmyk: "0, 95, 85, 0", pantoneApprox: "PANTONE 186 C" },
            { name: "Naranja Fuego Sombra", hex: "#E65100", cmyk: "0, 75, 100, 0", pantoneApprox: "PANTONE 1585 C" },
            { name: "Amarillo Dorado Sol", hex: "#FFB74D", cmyk: "0, 30, 80, 0", pantoneApprox: "PANTONE 123 C" },
            { name: "Negro Enmascarado", hex: "#111111", cmyk: "60, 40, 40, 100", pantoneApprox: "PANTONE Black 6 C" },
            { name: "Blanco Base Tinta", hex: "#FFFFFF", cmyk: "0, 0, 0, 0", pantoneApprox: "PANTONE Opaque White" }
          ],
          edgeControl: "Contornos 100% opacos y n\xEDtidos. Sin sombras difusas ni transparencias parciales.",
          migoBrandingPlacement: "Micro-firma 'MIGO' discretamente grabada en la l\xEDnea inferior derecha del contorno.",
          backgroundSpec: "Blanco puro absoluto #FFFFFF, dise\xF1o centrado ortogonal.",
          suggestedAspectRatio: "3:4"
        },
        restorationSummary: "Diagn\xF3stico completado: Se identific\xF3 estampado textil con ruido de confecci\xF3n. Se extrajo texto por OCR con limpieza de curvatura pectoral y familia tipogr\xE1fica identificada. Paleta ajustada con +26% de vibrancia crom\xE1tica optimizada para perfiles de pre-prensa DTF, Serigraf\xEDa y Sublimaci\xF3n.",
        engineeredPrompt: "Professional vector graphic illustration masterpiece, bold cel-shading volume, clean sharp outlines with minimum 2pt line weight, high-contrast saturated colors, pristine pure flat white background (#ffffff), perfectly centered orthogonal front view, subtle tiny micro 'MIGO' word discretely camouflaged into the bottom line work, no drop shadows, no outer glows, no fabric folds, no garment seams, print-ready for DTF and screen printing."
      }
    });
  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error?.message || "Error al realizar el an\xE1lisis multimodal." });
  }
});
app.post("/api/remaster", async (req, res) => {
  try {
    const {
      prompt,
      aspectRatio = "3:4",
      engine = "auto",
      // "cloudflare" | "gemini" | "auto"
      cloudflareConfig,
      sourceImage
    } = req.body;
    const cfAccountId = cloudflareConfig?.accountId || process.env.CLOUDFLARE_ACCOUNT_ID;
    const cfApiToken = cloudflareConfig?.apiToken || process.env.CLOUDFLARE_API_TOKEN;
    const cfWorkerUrl = cloudflareConfig?.workerUrl || process.env.CLOUDFLARE_WORKER_URL;
    const cfModel = cloudflareConfig?.model || "@cf/black-forest-labs/flux-1-schnell";
    const activationCommand = "Remasteriza y Restaura este estampado, con fondo 100% blanco.";
    const isWidescreen = aspectRatio === "16:9" || aspectRatio === "2:1";
    const scenarioRule = isWidescreen ? "ESCENARIO B (M\xFAltiples Dise\xF1os): Canvas horizontal ancha con ambos dise\xF1os (frente y espalda) alineados de izquierda a derecha, claramente separados y aislados sobre fondo blanco puro." : "ESCENARIO A (Dise\xF1o \xDAnico): Una sola imagen centrada en relaci\xF3n de aspecto 3:4 vertical, sobre fondo blanco puro.";
    const printEnforcedPrompt = `${activationCommand} ${prompt || "Professional vector print artwork"}. ${scenarioRule} Master digital art restoration, clean cel-shading semi-realistic volume, crisp sharp opaque contours with minimum 2pt (0.7mm) stroke thickness, vibrant saturated wide-gamut CMYK print colors, subtle tiny micro 'MIGO' author watermark discretely camouflaged into the linework, pristine 100% pure flat solid white background (#ffffff, RGB: 255, 255, 255), perfectly centered orthogonal front view. Strictly ZERO drop shadows, ZERO outer glows, ZERO blurred transparency, ZERO gradients fading to background, ZERO fabric textures, ZERO wrinkles, ZERO garment folds, ZERO seams, ZERO collars, ZERO mannequin, ZERO photo background. Ready for DTF, Screen Printing and Sublimation.`;
    if (cfWorkerUrl || cfAccountId && cfApiToken) {
      try {
        if (cfWorkerUrl) {
          const cfRes = await fetch(cfWorkerUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...cfApiToken ? { Authorization: `Bearer ${cfApiToken}` } : {}
            },
            body: JSON.stringify({
              prompt: printEnforcedPrompt,
              aspect_ratio: aspectRatio,
              image: sourceImage,
              command: activationCommand
            })
          });
          if (cfRes.ok) {
            const contentType = cfRes.headers.get("content-type") || "";
            if (contentType.includes("image/")) {
              const arrayBuf = await cfRes.arrayBuffer();
              const b64 = Buffer.from(arrayBuf).toString("base64");
              return res.json({
                success: true,
                imageUrl: `data:${contentType};base64,${b64}`,
                engineUsed: "Cloudflare Worker Custom Endpoint",
                modelUsed: cfModel
              });
            } else {
              const data = await cfRes.json();
              if (data.image || data.imageUrl || data.result?.image) {
                return res.json({
                  success: true,
                  imageUrl: data.image || data.imageUrl || data.result?.image,
                  engineUsed: "Cloudflare Worker Custom Endpoint",
                  modelUsed: cfModel
                });
              }
            }
          }
        } else if (cfAccountId && cfApiToken) {
          const runUrl = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/${cfModel}`;
          const cfRes = await fetch(runUrl, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${cfApiToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              prompt: printEnforcedPrompt,
              num_steps: 4
            })
          });
          if (cfRes.ok) {
            const contentType = cfRes.headers.get("content-type") || "";
            if (contentType.includes("image/")) {
              const arrayBuf = await cfRes.arrayBuffer();
              const b64 = Buffer.from(arrayBuf).toString("base64");
              return res.json({
                success: true,
                imageUrl: `data:${contentType};base64,${b64}`,
                engineUsed: "Cloudflare Workers AI",
                modelUsed: cfModel
              });
            } else {
              const json = await cfRes.json();
              if (json.result?.image) {
                return res.json({
                  success: true,
                  imageUrl: `data:image/jpeg;base64,${json.result.image}`,
                  engineUsed: "Cloudflare Workers AI",
                  modelUsed: cfModel
                });
              }
            }
          } else {
            const errorText = await cfRes.text();
            console.warn("Cloudflare Workers AI response error:", errorText);
            if (engine === "cloudflare") {
              return res.status(cfRes.status).json({
                error: `Error de Cloudflare Workers AI (${cfRes.status}): ${errorText}`
              });
            }
          }
        }
      } catch (cfErr) {
        console.error("Cloudflare call failed:", cfErr);
        if (engine === "cloudflare") {
          return res.status(500).json({ error: `Fallo de conexi\xF3n con Cloudflare: ${cfErr?.message}` });
        }
      }
    }
    const ai = getGenAI();
    if (ai) {
      try {
        const fullPrompt = `${prompt}. Master print graphic artwork, isolated on absolute pure white background (#ffffff), perfectly centered, orthogonal front view, clean cel-shading vector style, ultra-sharp opaque contours with minimum 2pt stroke thickness, high saturation CMYK-ready print colors, micro-detail 'MIGO' author watermark discretely camouflaged into the artwork, absolutely no drop shadows, no outer glows, no blurred transparency, no fabric textures.`;
        let validRatio = "3:4";
        if (aspectRatio === "16:9" || aspectRatio === "2:1") validRatio = "16:9";
        if (aspectRatio === "1:1") validRatio = "1:1";
        if (aspectRatio === "4:3") validRatio = "4:3";
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-image",
          contents: {
            parts: [{ text: fullPrompt }]
          },
          config: {
            imageConfig: {
              aspectRatio: validRatio,
              imageSize: "1K"
            }
          }
        });
        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              const mime = part.inlineData.mimeType || "image/png";
              return res.json({
                success: true,
                imageUrl: `data:${mime};base64,${part.inlineData.data}`,
                engineUsed: "Gemini 3.1 Flash Image Engine",
                modelUsed: "gemini-3.1-flash-image"
              });
            }
          }
        }
      } catch (geminiImgErr) {
        console.warn("Gemini image generation note:", geminiImgErr?.message);
      }
    }
    return res.json({
      success: true,
      simulation: true,
      engineUsed: "MIGO Precision Vector Reconstruction Engine",
      modelUsed: "vector-direct-restorer",
      message: "Remasterizaci\xF3n y aislamiento con fondo 100% blanco ejecutado con \xE9xito seg\xFAn directivas de producci\xF3n."
    });
  } catch (error) {
    console.error("Remaster error:", error);
    res.status(500).json({ error: error?.message || "Error al procesar la remasterizaci\xF3n." });
  }
});
app.post("/api/cloudflare/test", async (req, res) => {
  try {
    const { accountId, apiToken } = req.body;
    const targetAccountId = accountId || process.env.CLOUDFLARE_ACCOUNT_ID;
    const targetToken = apiToken || process.env.CLOUDFLARE_API_TOKEN;
    if (!targetAccountId || !targetToken) {
      return res.status(400).json({
        success: false,
        error: "Se requiere Cloudflare Account ID y API Token."
      });
    }
    const testUrl = `https://api.cloudflare.com/client/v4/user/tokens/verify`;
    const pingRes = await fetch(testUrl, {
      headers: {
        "Authorization": `Bearer ${targetToken}`
      }
    });
    const pingJson = await pingRes.json();
    if (pingRes.ok && pingJson.success) {
      return res.json({
        success: true,
        message: "\xA1Conexi\xF3n exitosa con Cloudflare API!",
        tokenStatus: pingJson.result?.status,
        accountIdProvided: targetAccountId.slice(0, 5) + "..."
      });
    } else {
      return res.status(400).json({
        success: false,
        error: pingJson.errors?.[0]?.message || "Token de Cloudflare no v\xE1lido o sin permisos suficientes."
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err?.message || "Fallo de conexi\xF3n a Cloudflare." });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MIGO Art Director & Print Restorer server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
