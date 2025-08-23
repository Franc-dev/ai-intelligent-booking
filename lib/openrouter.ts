import { createOpenAI } from "@ai-sdk/openai"

export const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
})

export const bookingModel = openrouter("z-ai/glm-4.5-air:free")
