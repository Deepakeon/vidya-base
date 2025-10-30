export interface LLMInput {
  /**
   * Optional text input for the model.
   */
  text?: string;

  /**
   * Optional audio input — can be a Blob or a URL string.
   */
  audio?: (string | Blob)[];
}

/**
 * Base abstract class for all language models.
 */
export abstract class LLM {
  /**
   * Model identifier (e.g. "gemini-nano", "gemini-pro", "gpt-4o-mini").
   */
  abstract readonly model: string;

  /**
   * Send input (text, audio, or both) to the model and receive a text response.
   * You can extend this for streaming or structured outputs later.
   */
  abstract generate(input: LLMInput): Promise<string>;

  /**
   * Optional: setup or warm-up logic for lightweight or local models.
   */
  async initialize(): Promise<void> {
    // Default no-op
  }
}
