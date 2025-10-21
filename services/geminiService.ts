import { GoogleGenAI, Type } from "@google/genai";
import type { Transcription } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const transcribeMedia = async (base64Data: string, mimeType: string): Promise<Transcription> => {
  if (!process.env.API_KEY) {
    throw new Error("API key not found. Please set the API_KEY environment variable.");
  }
  
  if (!mimeType.startsWith('audio/') && !mimeType.startsWith('video/')) {
    throw new Error("Unsupported file type. Please upload an audio or video file.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: `
                Your task is to transcribe the audio from the provided media file.
                1. Transcribe the audio into English.
                2. Segment the transcription into chunks, where each chunk corresponds to approximately 10 seconds of audio. Do not exceed 15 seconds for any chunk.
                3. For each chunk, provide the 'startTime' and 'endTime' in seconds.
                4. Translate each English transcription chunk into Hindi.
                5. Format the output as a JSON array, where each object in the array represents a transcribed chunk and contains 'startTime', 'endTime', 'english' (the English text), and 'hindi' (the Hindi text).
              `,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              startTime: {
                type: Type.NUMBER,
                description: "The start time of the segment in seconds.",
              },
              endTime: {
                type: Type.NUMBER,
                description: "The end time of the segment in seconds.",
              },
              english: {
                type: Type.STRING,
                description: "The English transcription for this segment.",
              },
              hindi: {
                type: Type.STRING,
                description: "The Hindi translation for this segment.",
              },
            },
            required: ["startTime", "endTime", "english", "hindi"],
          }
        },
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    
    if (Array.isArray(parsedJson)) {
        const isValid = parsedJson.every(item => 
            typeof item.startTime === 'number' &&
            typeof item.endTime === 'number' &&
            typeof item.english === 'string' &&
            typeof item.hindi === 'string'
        );
        if (isValid) {
            return parsedJson as Transcription;
        }
    } 
    throw new Error("Received malformed JSON data from API.");


  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
        throw new Error("The provided API key is invalid. Please check your configuration.");
    }
    throw new Error("Failed to transcribe the media. The model may not have been able to process the request.");
  }
};
