
import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const createReunificationImage = async (
  childPhotoBase64: string,
  childMimeType: string,
  adultPhotoBase64: string,
  adultMimeType: string
): Promise<string> => {
  const model = 'gemini-2.5-flash-image';
  
  const prompt = `
    You are an expert digital artist specializing in photorealistic compositions.
    Your task is to merge two photos into a single, heartwarming image.
    The first image is a childhood photo. The second is a recent photo of the same person as an adult.
    
    Create a new image where the adult from the second photo is affectionately hugging their younger self from the first photo.

    Key requirements:
    1.  **Interaction**: The hug and interaction must look natural, gentle, and emotionally resonant.
    2.  **Lighting**: Use soft, natural lighting that unifies both figures seamlessly.
    3.  **Background**: Replace the original backgrounds from both photos with a clean, smooth, and slightly off-white studio background to focus on the subjects.
    4.  **Realism**: Ensure the final image is photorealistic, maintaining the likeness of the person at both ages.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: childPhotoBase64,
              mimeType: childMimeType,
            },
          },
          {
            inlineData: {
              data: adultPhotoBase64,
              mimeType: adultMimeType,
            },
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("No image data found in the API response.");

  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to generate image with Gemini API.");
  }
};
