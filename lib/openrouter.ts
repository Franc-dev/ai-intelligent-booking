// Lightweight OpenRouter REST client (no AI SDK)

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

export const MODELS = {
  primary: "openai/gpt-3.5-turbo",
  fallback: "anthropic/claude-3-haiku-20240307",
  backup: "google/gemini-pro",
  emergency: "meta-llama/llama-3.1-8b-instruct:free",
} as const

type ModelName = typeof MODELS[keyof typeof MODELS]

function getHeaders() {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set")

  // OpenRouter recommends sending Referer/X-Title
  const referer = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "HTTP-Referer": referer,
    "X-Title": "AI Booking Agent",
  }
}

export async function chatCompletion(params: {
  model: ModelName
  system?: string
  prompt: string
  temperature?: number
  maxTokens?: number
}): Promise<{ text: string }> {
  const body = {
    model: params.model,
    messages: [
      ...(params.system ? [{ role: "system", content: params.system }] : []),
      { role: "user", content: params.prompt },
    ],
    temperature: params.temperature ?? 0.3,
    max_tokens: params.maxTokens ?? 512,
  }

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`OpenRouter error ${res.status}: ${text.slice(0, 300)}`)
  }
  const data: any = await res.json()
  const text = data?.choices?.[0]?.message?.content ?? ""
  return { text }
}

// Attempts to coerce the model to return a JSON object; falls back to parsing
export async function jsonObjectCompletion<T = any>(params: {
  model: ModelName
  system?: string
  prompt: string
  schemaHint?: string // optional textual hint of expected JSON shape
  temperature?: number
  maxTokens?: number
}): Promise<{ object: T }> {
  const body = {
    model: params.model,
    messages: [
      ...(params.system ? [{ role: "system", content: params.system }] : []),
      {
        role: "user",
        content:
          (params.schemaHint
            ? `Return ONLY a valid JSON object matching: ${params.schemaHint}. `
            : "Return ONLY a valid JSON object. ") + params.prompt,
      },
    ],
    // OpenAI-compatible JSON mode (supported by many OpenRouter models)
    response_format: { type: "json_object" },
    temperature: params.temperature ?? 0.2,
    max_tokens: params.maxTokens ?? 600,
  }

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  })

  const raw = await res.text()
  if (!res.ok) throw new Error(`OpenRouter error ${res.status}: ${raw.slice(0, 300)}`)

  try {
    const data: any = JSON.parse(raw)
    const content = data?.choices?.[0]?.message?.content ?? "{}"
    return { object: JSON.parse(content) as T }
  } catch {
    // Fallback: best-effort JSON extraction
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return { object: JSON.parse(match[0]) as T }
      } catch {
        // ignore
      }
    }
    throw new Error("Failed to parse JSON response from OpenRouter")
  }
}

export type { ModelName }
