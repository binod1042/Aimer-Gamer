import { GoogleGenAI } from "@google/genai";
import { GameStats } from "../types";

const GEMINI_API_KEY = process.env.API_KEY || '';

// Initialize the client only if the key exists to avoid immediate errors, 
// though robust apps should handle this gracefully.
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const getAiCoachingTips = async (stats: GameStats): Promise<string> => {
  if (!GEMINI_API_KEY) {
    return "API Key not configured. Unable to generate AI coaching tips.";
  }

  try {
    const prompt = `
      You are a world-class Esports Aim Coach. Analyze the following player statistics from a reflex aim training session:
      
      Score: ${stats.score}
      Accuracy: ${stats.accuracy.toFixed(1)}%
      Targets Hit: ${stats.clickedTargets}
      Targets Missed (Background Clicks): ${stats.missedClicks}
      Targets Expired (Too Slow): ${stats.targetsExpired}
      Average Reaction Time: ${Math.round(stats.avgReactionTime)}ms

      Provide 3 short, punchy, and actionable tips to help them improve. 
      Focus on the specific weaknesses shown in the stats (e.g., if accuracy is low but speed is high, tell them to slow down).
      Keep the tone encouraging but professional. Format as a bulleted list.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        maxOutputTokens: 300,
        temperature: 0.7,
      }
    });

    return response.text || "Keep practicing to generate more data for analysis!";
  } catch (error) {
    console.error("Error generating AI tips:", error);
    return "The AI Coach is currently offline. Please try again later.";
  }
};