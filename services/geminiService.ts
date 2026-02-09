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
    return "Sommelier Offline: API_KEY is not configured in environment variables.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const cellarContext = cellar.length > 0 
      ? `Cellar Content: ${cellar.map(w => `${w.vintage} ${w.producer} ${w.name} x${w.quantity}`).join(', ')}.`
      : "The cellar is currently empty.";

    const systemInstruction = `You are 'Cellar Rat', an elite Master Sommelier. Tone: Knowledgeable, refined, helpful. Context: ${cellarContext}. Provide expert wine advice.`;

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

    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    return `Connection Error: ${error.message}`;
  }
};

export const analyzeLabel = async (base64Image: string): Promise<Partial<Wine> | null> => {
  if (!process.env.API_KEY) {
    throw new Error("Missing API_KEY. Please set it in your environment variables.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: "Identify this wine label. Extract name, producer, varietal, vintage, region, and type (Red, White, Rosé, Sparkling, Dessert). Return valid JSON." }
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