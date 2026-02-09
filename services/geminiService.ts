import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Wine, ChatMessage } from "../types";

/**
 * Clean AI response text to ensure it's valid JSON
 */
const cleanJsonResponse = (text: string): string => {
  // Removes markdown code blocks and excess whitespace
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const getSommelierResponse = async (
  query: string,
  cellar: Wine[],
  history: ChatMessage[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "The sommelier is currently offline. Please ensure your API_KEY is set in Vercel.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const cellarContext = cellar.length > 0 
      ? `The user's cellar contains: ${cellar.map(w => `${w.vintage} ${w.producer} ${w.name} (${w.varietal}) x${w.quantity}`).join(', ')}.`
      : "The user's cellar is currently empty.";

    const systemInstruction = `You are 'Cellar Rat', an elite Master Sommelier. 
      Your tone is sophisticated, knowledgeable, and helpful. 
      Context: ${cellarContext}
      Provide expert advice on wine pairings, storage, and collection management. 
      Always respond in Markdown format.`;

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

    return response.text || "I apologize, I am finding it difficult to retrieve my tasting notes at the moment.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return `Sommelier connection error: ${error.message || "Unknown error"}. Please check logs.`;
  }
};

export const analyzeLabel = async (base64Image: string): Promise<Partial<Wine> | null> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY missing. Label scanning requires an active Gemini API key.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: "Identify this wine label. Extract: name, producer, varietal, vintage, region, and type (Red, White, Rosé, Sparkling, Dessert). Output ONLY a valid JSON object." }
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

    const text = response.text;
    if (text) {
      try {
        return JSON.parse(cleanJsonResponse(text));
      } catch (e) {
        console.error("Failed to parse label JSON:", e, text);
        return null;
      }
    }
    return null;
  } catch (error: any) {
    console.error("Label Analysis Error:", error);
    throw error;
  }
};