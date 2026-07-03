import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";

/** Default model. The SDK guidance is to not downgrade for cost without the user's say-so. */
const DEFAULT_MODEL = "claude-opus-4-8";

/** Thrown for any AI failure (missing key, refusal, API error, unparseable output). */
export class AiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiError";
  }
}

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AiError("ANTHROPIC_API_KEY is not set — add it to .env.local.");
  }
  client ??= new Anthropic();
  return client;
}

export interface GenerateStructuredParams<T> {
  schema: z.ZodType<T>;
  system: string;
  user: string;
  model?: string;
  maxTokens?: number;
}

export interface GenerateStructuredResult<T> {
  data: T;
  model: string;
  tokensUsed: number | null;
}

/**
 * Ask Claude for JSON validated against a Zod schema. Uses native structured outputs
 * (messages.parse + zodOutputFormat) so the returned object already conforms to `schema`.
 */
export async function generateStructured<T>({
  schema,
  system,
  user,
  model = DEFAULT_MODEL,
  maxTokens = 2048,
}: GenerateStructuredParams<T>): Promise<GenerateStructuredResult<T>> {
  const anthropic = getClient();

  let response;
  try {
    response = await anthropic.messages.parse({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
      output_config: { format: zodOutputFormat(schema) },
    });
  } catch (e) {
    throw new AiError(e instanceof Error ? e.message : "AI request failed");
  }

  if (response.stop_reason === "refusal") {
    throw new AiError("The AI declined to process this request.");
  }
  if (response.parsed_output == null) {
    throw new AiError("The AI response did not match the expected format.");
  }

  const total =
    (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0);

  return {
    data: response.parsed_output as T,
    model: response.model,
    tokensUsed: total > 0 ? total : null,
  };
}
