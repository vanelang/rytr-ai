import { groq } from "@ai-sdk/groq";

export const availableModels = [groq("mixtral-8x7b-32768"), groq("llama3-70b-8192")] as const;

export function getRandomModel() {
  const randomIndex = Math.floor(Math.random() * availableModels.length);
  return availableModels[randomIndex];
}
