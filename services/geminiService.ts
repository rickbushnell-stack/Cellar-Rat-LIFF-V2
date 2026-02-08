import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Wine, ChatMessage } from "../types";

/**
 * Clean AI response text to ensure it's valid JSON
 */
const cleanJsonResponse = (text: string): string => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const getSommelierResponse = async (
  query: string,
  cellar: Wine[],
  history: ChatMessage[]
): Promise<string> => {
  try {
    // Standard initialization using injected API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const cellarContext = cellar.length > 0 
      ? `The user's cellar contains: ${cellar.map(w => `${w.vintage} ${w.producer} ${w.name} (${w.varietal}, ${w.type}) x${w.quantity}`).join(', ')}.`
      : "The user's cellar is currently empty.";

    const systemInstruction = `You are Cellar Rat, a world-class Master Sommelier. 
      Your tone is sophisticated, knowledgeable, yet accessible. 
      ${cellarContext}
      Provide expert advice on wine pairings, aging potential, and recommendations from their existing collection. 
      If asked about wine types (like red wines), give rich, descriptive answers that a collector would appreciate.
      Always prioritize using their current inventory for pairing suggestions.`;

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
        temperature: 0.8,
      },
    });

    return response.text || "I apologize, my tasting notes are a bit fuzzy. Could you repeat that?";
  } catch (error: any) {
    console.error("Gemini Sommelier API Error:", error);
    // Explicitly returning error details helps diagnose configuration issues in Vercel
    return `The cellar door seems stuck. Error: ${error.message || "Unknown Connection Issue"}. Please ensure your API_KEY is correctly set in Vercel and that you have redeployed.`;
  }
};

export const analyzeLabel = async (base64Image: string): Promise<Partial<Wine> | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: "Identify this wine label. Extract: Name, Producer, Varietal, Vintage, Region, and Type (Red, White, Rosé, Sparkling, Dessert). Return ONLY a JSON object." }
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
      const cleanedJson = cleanJsonResponse(response.text);
      return JSON.parse(cleanedJson);
    }
    return null;
  } catch (error: any) {
    console.error("Label Analysis Error:", error);
    throw error;
  }
};