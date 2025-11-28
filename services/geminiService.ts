import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateArchitectAdvice = async (
  conversationHistory: ChatMessage[],
  currentPrompt: string
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Error: API Key not configured.";

  try {
    const model = 'gemini-2.5-flash';
    
    // Construct a context-aware prompt
    const systemInstruction = `
      You are HomeDream AI, an expert Architect and Interior Designer. 
      Your goal is to help users design their dream home. 
      Provide concise, professional advice on:
      - Floor plan layouts
      - Furniture arrangement ergonomics
      - Color theory and materials
      - Standard dimensions (doors, hallways, counter heights)
      - Sustainable design practices
      
      Keep answers practical and helpful for a CAD software user.
      If asked about technical measurements, be precise.
    `;

    // Simple chat history construction for context
    let historyText = "";
    conversationHistory.forEach(msg => {
      historyText += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}\n`;
    });

    const fullPrompt = `${historyText}\nUser: ${currentPrompt}`;

    const response = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error connecting to the AI Architect service.";
  }
};
