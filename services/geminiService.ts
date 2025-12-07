
import { GoogleGenAI, Type } from "@google/genai";
import { CommandCategory, GeneratedCommand } from '../types';

const MODEL_NAME = 'gemini-2.5-flash';

export const generateTerminalCommand = async (
  userQuery: string,
  currentDirectoryContext: string,
  fileListContext: string = '',
  customApiKey?: string
): Promise<GeneratedCommand> => {
  
  // Prioritize custom user key, then fallback to env var
  const effectiveKey = customApiKey || process.env.API_KEY || '';

  if (!effectiveKey) {
    return {
      command: "echo 'Error: API Key missing'",
      category: CommandCategory.HARMLESS,
      explanation: "Please configure your Gemini API Key in Settings > Online Models to use this feature."
    };
  }

  // Initialize client dynamically to use the correct key
  const ai = new GoogleGenAI({ apiKey: effectiveKey });

  const prompt = `
    You are an AI assistant for a macOS terminal helper tool called "Substage". 
    Your goal is to translate user natural language requests into macOS zsh terminal commands.
    
    The user is currently in this directory: ${currentDirectoryContext}
    
    The files currently in this directory are:
    ${fileListContext}
    
    The user query is: "${userQuery}"

    Rules for the simulation:
    - Prefer simple, standard commands: mkdir, touch, mv, cp, rm, ffmpeg.
    - IMPORTANT: Use the exact filenames provided in the list above. If the user says "delete screenshot", and the list has "Screenshot.png", use "rm Screenshot.png".
    - If the user wants to organize files (e.g., "put all images in a folder"), generate a CHAINED command using '&&'. 
      Example: "mkdir Images && mv *.png Images/"
    - Keep paths relative if possible.

    Return the response in a structured JSON format with:
    1. "command": The exact terminal command string.
    2. "category": One of [harmless, create, rename, move, delete, modify, unknown].
    3. "explanation": A short, one-sentence description of what the command does.

    If the request is unsafe or malicious, return a harmless "echo" command explaining why.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            command: { type: Type.STRING },
            category: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["command", "category", "explanation"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const result = JSON.parse(text) as GeneratedCommand;
    
    // Normalize category string to enum just in case
    const validCategories = Object.values(CommandCategory);
    if (!validCategories.includes(result.category)) {
        result.category = CommandCategory.UNKNOWN;
    }

    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      command: "echo 'Error generating command'",
      category: CommandCategory.UNKNOWN,
      explanation: "Failed to generate command due to an API error."
    };
  }
};
