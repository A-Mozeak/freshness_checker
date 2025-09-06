
import { GoogleGenAI, Type } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import type { AnalysisResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    foodName: { type: Type.STRING, description: "The name of the food item in the image, or 'No food detected' if none is found." },
    isSpoiled: { type: Type.STRING, enum: ['Fresh', 'Spoiled', 'Unsure', 'N/A'], description: "The freshness status of the food, or 'N/A' if no food is detected." },
    explanation: { type: Type.STRING, description: "A detailed explanation of the freshness assessment, or why no food was detected." },
    sensoryChecks: { type: Type.STRING, description: "If unsure, detailed advice on checking for spoilage using smell, texture, and visual cues (not from the image). If no food is detected, this can be an empty string." },
  },
  required: ['foodName', 'isSpoiled', 'explanation', 'sensoryChecks'],
};

export const analyzeImage = async (base64Image: string, mimeType: string): Promise<AnalysisResult> => {
  const imagePart = {
    inlineData: { data: base64Image, mimeType },
  };
  const textPart = {
    text: `Analyze this image. Identify if there is a food item present. 
- If food is present: Identify the food item. Determine if it is fresh or spoiled. If you are unsure, state that. Provide a detailed explanation for your assessment. If you are unsure, also provide detailed advice on how to check for spoilage using smell, texture, and visual cues. 
- If no food is present: Set 'foodName' to 'No food detected', 'isSpoiled' to 'N/A', and provide an explanation for what you see in the image instead.
Respond in the requested JSON format.`,
  };

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
    config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
    }
  });

  const jsonString = response.text;
  try {
      const result: AnalysisResult = JSON.parse(jsonString);
      return result;
  } catch(e) {
      console.error("Failed to parse JSON response from Gemini:", jsonString, e);
      throw new Error("Could not understand the AI's response.");
  }
};

export const generateSpoiledImages = async (foodName: string): Promise<string[]> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `A realistic, high-quality photo of a spoiled ${foodName}. Focus on the signs of spoilage like mold, discoloration, or wilting.`,
        config: {
            numberOfImages: 2,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1',
        },
    });

    return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
};

const spoilageDateSchema = {
    type: Type.OBJECT,
    properties: {
        startDate: { type: Type.STRING, description: "The start of the estimated spoilage date range in YYYY-MM-DD format." },
        endDate: { type: Type.STRING, description: "The end of the estimated spoilage date range in YYYY-MM-DD format." },
    },
    required: ['startDate', 'endDate'],
};

export const getSpoilageDate = async (foodName: string, purchaseDate: string): Promise<{ startDate: string, endDate: string }> => {
    const prompt = `Given that I bought ${foodName} on ${purchaseDate}, provide a typical spoilage date range, assuming proper storage. Respond in the requested JSON format with "startDate" and "endDate" properties.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: spoilageDateSchema
        }
    });

    try {
        return JSON.parse(response.text);
    } catch(e) {
        console.error("Failed to parse spoilage date JSON:", response.text, e);
        throw new Error("Could not get spoilage date estimate.");
    }
};