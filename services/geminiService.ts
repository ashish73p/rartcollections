import { GoogleGenAI, Type } from "@google/genai";
import { ArtworkAnalysisResponse } from "../types";

const processEnvApiKey = process.env.API_KEY;

export const analyzeArtworkImage = async (base64Data: string, mimeType: string): Promise<ArtworkAnalysisResponse> => {
  if (!processEnvApiKey) {
    console.warn("API Key not found, returning mock data.");
    return {
      title: "Untitled Upload",
      description: "Analysis unavailable without API Key.",
      medium: "Unknown",
      tags: ["Uploaded"]
    };
  }

  const ai = new GoogleGenAI({ apiKey: processEnvApiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          {
            text: "Analyze this artwork. Identify the likely medium (e.g., Oil on Canvas, Digital, Pencil), a creative title, a short evocative description, and 3-5 relevant style tags. Respond in JSON."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            medium: { type: Type.STRING },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["title", "description", "medium", "tags"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as ArtworkAnalysisResponse;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    // Fallback if AI fails
    return {
      title: "New Acquisition",
      description: "A beautiful piece of art uploaded to the collection.",
      medium: "Mixed Media",
      tags: ["Art", "New"]
    };
  }
};