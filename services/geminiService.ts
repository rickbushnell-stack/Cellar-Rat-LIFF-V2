
import { GoogleGenAI, Type } from "@google/genai";
import { Wine, ChatMessage } from "../types";

export const getSommelierResponse = async (
  query: string,
  cellar: Wine[],
  history: ChatMessage[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const cellarContext = cellar.length > 0 
    ? `The user's cellar contains: ${cellar.map(w => `${w.vintage} ${w.producer} ${w.name} (${w.varietal}, ${w.type}) x${w.quantity}`).join(', ')}.`
    : "The user's cellar is currently empty.";

  const systemPrompt = `You are VintnerAI, a world-class Master Sommelier. 
    Your tone is sophisticated, knowledgeable, yet accessible. 
    ${cellarContext}
    Provide expert advice on wine pairings, aging potential, and recommendations from their existing collection. 
    If they ask for something they don't have, politely suggest the best alternative from their cellar or explain what style they should look for.
    Always prioritize using their current inventory for pairing suggestions.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.text }]
        })),
        { role: 'user', parts: [{ text: query }] }
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    return response.text || "I apologize, my tasting notes are a bit fuzzy. Could you repeat that?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The cellar door seems stuck. Please check your connection and try again.";
  }
};

export const analyzeLabel = async (base64Image: string): Promise<Partial<Wine> | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: "Extract wine details from this label: Name, Producer, Varietal, Vintage, Region, and Type (Red, White, Rosé, Sparkling, Dessert). Return ONLY JSON." }
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
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Label Analysis Error:", error);
    return null;
  }
};
