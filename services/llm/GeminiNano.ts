import { LLM } from "./llm";
import { PROMPT_CHUNK_SUMMARY } from "./prompt";

// Gemini prompt API, only allows 5 audio blobs of 30 seconds each per session
export const AUDIO_CHUNKS_PER_SESSION = 5;

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
    clone: () => Promise<LanguageModelSession>;
    destroy: () => void;
}

declare const LanguageModel: {
    availability(): Promise<"available" | "downloadable" | "unavailable">;
    params(): Promise<LanguageModelParams>;
    create(options?: {
        temperature?: number;
        topK?: number;
        expectedInputs?: Array<{ type: "text" | "audio" }>;
        initialPrompts: LanguageModelInput[];
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
    > | string;
}
export class GeminiNano extends LLM {
    readonly model = "gemini-nano";
    session: LanguageModelSession | null = null;
    sessionClones: LanguageModelSession[] = [];
    isAvailable = false;
    params: LanguageModelParams | null = null;
    availability: "available" | "downloadable" | "unavailable" | null = null;

    /**
     * Checks if Gemini Nano is available and sets up the model if allowed.
     * Should be called during a user gesture (click, tap, etc.) if model is not yet ready.
     */
    async checkAvailability(): Promise<{ available: boolean, needsDownload: boolean }> {
        this.availability = await LanguageModel.availability();
        console.log("Gemini Nano availability:", this.availability);
        this.isAvailable = this.availability !== "unavailable"
        return { available: this.isAvailable, needsDownload: this.availability === "downloadable" }
    }

    /**
     * Creates a model instance. Requires user activation if model isn’t ready.
     */
    async createSession(cloneCount = 1, initialPrompts: LanguageModelInput[] = [{
        role: "system",
        content: PROMPT_CHUNK_SUMMARY
    }], onDownloadProgress?: (progress: number) => void): Promise<void> {
        try {
            this.session?.destroy();
            this.session = await LanguageModel.create({
                initialPrompts: initialPrompts,
                expectedInputs: [{ type: "text" }, { type: "audio" }],
                monitor(m) {
                    m.addEventListener("downloadprogress", (e) => {
                        console.log(`Downloaded ${(e.loaded * 100).toFixed(1)}%`);
                        onDownloadProgress?.((e.loaded * 100))
                    });
                },
            });
            this.sessionClones = await Promise.all(Array.from({ length: cloneCount }, (_, i) => {
                console.log(`${i} clone created`)
                return this.session!.clone()
            }));
            this.sessionClones.push(this.session)
            this.isAvailable = true;
            console.log("Gemini Nano model instance created successfully.");
        } catch (err) {
            console.error("Failed to create Gemini Nano model:", err);
            this.isAvailable = false;
        }
    }

    async generate(
        input:
            { text?: string; audio?: (string | Blob)[] },
        session = this.session,
        options?: Partial<LanguageModelParams>,
    ): Promise<string> {
        if (!this.isAvailable || !session) {
            throw new Error("Gemini Nano model not initialized. Call initialize() and createSession() first.");
        }

        if (!input.text && !input.audio) {
            throw new Error("At least one of 'text' or 'audio' must be provided.");
        }

        try {
            const content: LanguageModelInput["content"] = [];

            if (input.text?.length) {
                content.push({ type: "text", value: input.text });
            }

            if (input.audio) {
                for (const audio of input.audio) {
                    const audioBlob =
                        typeof audio === "string"
                            ? await (await fetch(audio)).blob()
                            : audio;
                    content.push({ type: "audio", value: audioBlob });
                }

            }

            const result = await session.prompt([{ role: "user", content }], options);
            console.log(this.getSessionQuota())
            return result ?? "No response from Gemini Nano.";
        } catch (err) {
            console.error("Gemini Nano generation error:", err);
            throw err;
        }
    }

    async runPromptsInParallel(inputs:
        { text?: string; audio?: (string | Blob)[] }[],
        options?: Partial<LanguageModelParams>,
        onProgress?: (completed: number) => void
    ) {
        let completed = 0;

        const promises = inputs.map(async (input, index) => {
            const result = await this.generate(
                input,
                this.sessionClones[index] || this.session!,
                options
            );
            completed+=input?.audio?.length ?? 0;
            onProgress?.(completed);
            return result;
        });

        return Promise.all(promises);
    }

    getSessionQuota(): { used: number; total: number, remaining: number } {
        const used = this.session?.inputUsage ?? 0, total = this.session?.inputQuota ?? 0;
        return {
            used,
            total,
            remaining: total - used
        };
    }

    // getRemainingChunkQuota() {
    //     const { remaining } = this.getSessionQuota()
    //     const remainingSpeechSeconds = remaining / (this.tokenUsagePerSecond)
    //     const remainingChunks = Math.floor(remainingSpeechSeconds / this.audioChunkSizeInSeconds)

    //     return remainingChunks
    // }
}
