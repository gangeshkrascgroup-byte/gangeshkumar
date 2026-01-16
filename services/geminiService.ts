
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const assessSituation = async (context: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Assess the following safety context from a user who might be in danger. Determine if an emergency alert should be triggered. Context: ${context}`,
      config: {
        systemInstruction: "You are a professional safety emergency dispatcher AI. Analyze input for signs of distress, violence, or dangerous surroundings. Provide a danger level (LOW, MEDIUM, HIGH) and a recommended immediate action.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dangerLevel: { type: Type.STRING, description: "LOW, MEDIUM, or HIGH" },
            reasoning: { type: Type.STRING },
            action: { type: Type.STRING },
            shouldTriggerAlert: { type: Type.BOOLEAN }
          },
          required: ["dangerLevel", "reasoning", "action", "shouldTriggerAlert"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Assessment Error:", error);
    return { dangerLevel: 'UNKNOWN', shouldTriggerAlert: false };
  }
};

export const findSafeHavens = async (lat: number, lng: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find 3 real-world safe havens (police stations, 24/7 pharmacies, or hospitals) near coordinates ${lat}, ${lng}.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const havens: any[] = [];
    
    // Extract real locations from grounding chunks if possible, otherwise use text
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web) {
          havens.push({
            name: chunk.web.title,
            url: chunk.web.uri,
            type: 'Safe Haven'
          });
        }
      });
    }

    return havens.slice(0, 3);
  } catch (error) {
    console.error("Grounding Error:", error);
    return [];
  }
};

export const generateSafetyGuidance = async (location: string, situation: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The user is at ${location} and feels ${situation}. Give 3 quick, tactical safety tips for this specific scenario.`,
      config: {
        systemInstruction: "Be concise, tactical, and calm. Focus on survival and de-escalation."
      }
    });
    return response.text;
  } catch (error) {
    return "Stay in well-lit areas. Keep your phone in hand. Head towards the nearest open business.";
  }
};
