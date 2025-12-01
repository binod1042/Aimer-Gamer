import { GoogleGenAI } from "@google/genai";
import { GameStats } from "../types";

// Get API key using Vite format (NOT process.env)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ API key missing! Fix Vercel environment variables.");
  throw new Error("Gemini API key is missing.");
}

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey });

export const getAiCoachingTips = async (stats: GameStats): Promise<string> => {
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
      Focus on the specific weaknesses shown in the stats.
      Format as a bulleted list.
    `;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { temperature: 0.7 }
    });

    return result.text || "Keep practicing to generate more data!";
  } catch (error) {
    console.error("❌ Error generating AI tips:", error);
    return "The AI Coach is currently offline or the API key is invalid.";
  }
};
