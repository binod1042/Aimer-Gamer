import { GoogleGenAI } from "@google/genai";
import { GameStats } from "../types";

// Initialize Gemini client strictly using process.env.API_KEY as per guidelines.
// Assumes process.env.API_KEY is pre-configured and accessible.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    return "Unable to connect to AI Coach. Please check your internet connection or API limits.";
  }
};