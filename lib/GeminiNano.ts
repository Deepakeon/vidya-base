import { LLM } from "./llm";

interface LanguageModelParams {
    defaultTopK: number;
    maxTopK: number;
    defaultTemperature: number;
    maxTemperature: number;
}
interface LanguageModelSession {
    prompt(input: LanguageModelInput[], options?: Partial<LanguageModelParams>): Promise<string>;
    inputUsage: number;
    inputQuota: number;
}
declare const LanguageModel: {
    availability(): Promise<"available" | "downloadable" | "unavailable">;
    params(): Promise<LanguageModelParams>;
    create(options?: {
        temperature?: number;
        topK?: number;
        expectedInputs?: Array<{ type: "text" | "audio" }>;
        monitor?: (monitor: {
            addEventListener: (
                type: "downloadprogress",
                listener: (event: { loaded: number; }) => void
            ) => void;
        }) => void;
    }): Promise<LanguageModelSession>;
};
interface LanguageModelInput {
    role: "user" | "system";
    content: Array<
        | { type: "text"; value: string }
        | { type: "audio"; value: Blob }
    >;
}
export class GeminiNano extends LLM {
    readonly model = "gemini-nano";
    private session: LanguageModelSession | null = null;
    private isAvailable = false;
    private params: LanguageModelParams | null = null;
    private availability: "available" | "downloadable" | "unavailable" | null = null;

    /**
     * Checks if Gemini Nano is available and sets up the model if allowed.
     * Should be called during a user gesture (click, tap, etc.) if model is not yet ready.
     */
    async initialize(): Promise<void> {
        this.availability = await LanguageModel.availability();
        console.log("Gemini Nano availability:", this.availability);

        if (this.availability === "unavailable") {
            console.warn("Gemini Nano model unavailable on this device.");
            this.isAvailable = false;
            return;
        }
    }

    /**
     * Creates a model instance. Requires user activation if model isn’t ready.
     */
    async createSession(): Promise<void> {
        try {
            this.params = await LanguageModel.params();
            this.session = await LanguageModel.create({
                temperature: Math.min(this.params.defaultTemperature * 1.2, this.params.maxTemperature),
                topK: this.params.defaultTopK,
                expectedInputs: [{ type: "text" }, { type: "audio" }],
                monitor(m) {
                    m.addEventListener("downloadprogress", (e) => {
                        console.log(`Downloaded ${(e.loaded * 100).toFixed(1)}%`);
                    });
                },
            });
            this.isAvailable = true;
            console.log("Gemini Nano model instance created successfully.");
        } catch (err) {
            console.error("Failed to create Gemini Nano model:", err);
            this.isAvailable = false;
        }
    }

    async generate(
        input:
            { text?: string; audio?: string | Blob },
        options?: Partial<LanguageModelParams>
    ): Promise<string> {
        if (!this.isAvailable || !this.session) {
            throw new Error("Gemini Nano model not initialized. Call initialize() and createSession() first.");
        }

        if (!input.text && !input.audio) {
            throw new Error("At least one of 'text' or 'audio' must be provided.");
        }

        try {
            const content: LanguageModelInput["content"] = [];

            if (input.text) {
                content.push({ type: "text", value: input.text });
            }

            if (input.audio) {
                const audioBlob =
                    typeof input.audio === "string"
                        ? await (await fetch(input.audio)).blob()
                        : input.audio;
                content.push({ type: "audio", value: audioBlob });
            }

            const result = await this.session.prompt([{ role: "user", content }], options);
            return result ?? "No response from Gemini Nano.";
        } catch (err) {
            console.error("Gemini Nano generation error:", err);
            throw err;
        }
    }

    getSessionQuota(): { used: number; total: number } {
    return {
      used: this.session?.inputUsage ?? 0,
      total: this.session?.inputQuota ?? 0,
    };
  }
}
