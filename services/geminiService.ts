import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Wine, ChatMessage } from "../types";

const cleanJsonResponse = (text: string): string => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const getSommelierResponse = async (
  query: string,
  cellar: Wine[],
  history: ChatMessage[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Configuration error: API_KEY is missing. Check your environment settings.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const cellarContext = cellar.length > 0 
      ? `Cellar: ${cellar.map(w => `${w.vintage} ${w.producer} ${w.name} (${w.varietal}) x${w.quantity}`).join(', ')}.`
      : "Cellar is empty.";

    const systemInstruction = `You are Cellar Rat, a Master Sommelier. Tone: sophisticated, knowledgeable. ${cellarContext} Use Markdown.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        })),
        { role: 'user', parts: [{ text: query }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "I'm having trouble retrieving my tasting notes.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return `Connection issue: ${error.message || "Unknown error"}.`;
  }
};

export const analyzeLabel = async (base64Image: string): Promise<Partial<Wine> | null> => {
  if (!process.env.API_KEY) throw new Error("API_KEY missing");

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: "Identify this wine label. Return a JSON object with: name, producer, varietal, vintage, region, type (Red, White, Rosé, Sparkling, Dessert)." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            producer: { type: Type.STRING },
            varietal: { type: Type.STRING },
            vintage: { type: Type.STRING },
            region: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['Red', 'White', 'Rosé', 'Sparkling', 'Dessert'] },
          },
          required: ['name', 'producer', 'type'],
        }
      }
    });

    if (response.text) {
      return JSON.parse(cleanJsonResponse(response.text));
    }
    return null;
  } catch (error: any) {
    console.error("Label Analysis Error:", error);
    throw error;
  }
};