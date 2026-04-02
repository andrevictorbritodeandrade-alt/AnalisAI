import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function extractBetFromImage(base64Image: string, mimeType: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-preview",
      contents: [
        {
          inlineData: {
            data: base64Image.split(',')[1], // Remove data:image/jpeg;base64,
            mimeType: mimeType,
          },
        },
        "Extract the following information from this betting slip screenshot. The betting houses are usually one of: bet365, betano, betnacional, estrelabet, h2bet, pixbet, sportingbet, superbet, vaidebet. Return a JSON object with the following fields: house (string, lowercase), ticketNumber (string), stake (number, valor da aposta/entrada), returnAmount (number, retorno/ganho possível), odd (number, cotação), profit (number, lucro = retorno - stake), selections (string, the matches and markets selected, e.g., 'Team A x Team B + 9.5 corners'). If you cannot find a field, leave it empty or 0."
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            house: { type: Type.STRING },
            ticketNumber: { type: Type.STRING },
            stake: { type: Type.NUMBER },
            returnAmount: { type: Type.NUMBER },
            odd: { type: Type.NUMBER },
            profit: { type: Type.NUMBER },
            selections: { type: Type.STRING }
          },
          required: ["house", "stake", "returnAmount", "odd", "profit", "selections"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Error extracting bet from image:", error);
    throw error;
  }
}
