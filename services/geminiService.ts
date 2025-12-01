import { GoogleGenAI } from "@google/genai";
import { GameStats } from "../types";

// Safely access env var with optional chaining
// @ts-ignore - Ignore potential TS warnings about import.meta for compatibility
const apiKey = import.meta?.env?.VITE_GEMINI_API_KEY;

// Don't crash app if key is missing, just warn
if (!apiKey) {
  console.warn("⚠️ VITE_GEMINI_API_KEY is missing. AI features will be disabled.");
}

// Initialize lazily to prevent startup crash. Only create instance if key exists.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getAiCoachingTips = async (stats: GameStats): Promise<string> => {
  // Graceful fallback if AI is not initialized
  if (!ai) {
    return "AI Coach unavailable: API Key not configured. Please add VITE_GEMINI_API_KEY to your environment variables.";
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