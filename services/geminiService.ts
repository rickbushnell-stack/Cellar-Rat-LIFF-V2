import { GoogleGenAI, Type } from "@google/genai";
import { Wine, ChatMessage } from "../types";

/**
 * Clean AI response text to ensure it's valid JSON
 */
const cleanJsonResponse = (text: string): string => {
  // Remove markdown code blocks if present (e.g., ```json ... ```)
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const getSommelierResponse = async (
  query: string,
  cellar: Wine[],
  history: ChatMessage[]
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const cellarContext = cellar.length > 0 
      ? `The user's cellar contains: ${cellar.map(w => `${w.vintage} ${w.producer} ${w.name} (${w.varietal}, ${w.type}) x${w.quantity}`).join(', ')}.`
      : "The user's cellar is currently empty.";

    const systemPrompt = `You are Cellar Rat, a world-class Master Sommelier. 
      Your tone is sophisticated, knowledgeable, yet accessible. 
      ${cellarContext}
      Provide expert advice on wine pairings, aging potential, and recommendations from their existing collection. 
      Always prioritize using their current inventory for pairing suggestions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
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
  } catch (error: any) {
    console.error("Gemini Sommelier Error:", error);
    return "The cellar door seems stuck. Please check your connection and try again.";
  }
};

export const analyzeLabel = async (base64Image: string): Promise<Partial<Wine> | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    console.log("Starting label analysis with Gemini...");
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: "Identify this wine. Extract: Name, Producer, Varietal, Vintage, Region, and Type (Red, White, Rosé, Sparkling, Dessert). Return ONLY a JSON object. No extra text." }
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