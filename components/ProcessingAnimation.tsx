"use client"
import {
  Loader2,
  Download,
  AudioWaveform,
  Scissors,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  LucideIcon,
} from "lucide-react";
import { ProcessingStage } from "@/types";

interface StageConfig {
  icon: LucideIcon;
  label: string;
  color: string;
}

interface ProgressState {
  stage: ProcessingStage;
  message?: string;
  currentChunk?: number;
  totalChunks?: number;
  error?: string;
}

const stageConfig: Record<ProcessingStage, StageConfig> = {
  "model-init": {
    icon: Loader2,
    label: "Initializing AI Model",
    color: "text-orange-400",
  },
  "model-download": {
    icon: Download,
    label: "Downloading AI Model",
    color: "text-orange-400",
  },
  "audio-extraction": {
    icon: AudioWaveform,
    label: "Extracting Audio",
    color: "text-green-400",
  },
  "audio-chunking": {
    icon: Scissors,
    label: "Splitting Audio",
    color: "text-yellow-400",
  },
  transcription: {
    icon: FileText,
    label: "Transcribing Content",
    color: "text-purple-400",
  },
  summarization: {
    icon: Sparkles,
    label: "Generating Summaries",
    color: "text-pink-400",
  },
  "knowledge-base-creation": {
    icon: Sparkles,
    label: "Building Knowledge Base",
    color: "text-orange-400",
  },
  complete: {
    icon: CheckCircle2,
    label: "Complete",
    color: "text-green-500",
  },
  error: {
    icon: AlertCircle,
    label: "Error",
    color: "text-red-500",
  },
  idle: {
    icon: Loader2,
    label: "Ready",
    color: "text-gray-400",
  },
} as const;

export function ProcessingAnimation({ progress }: { progress: ProgressState }) {
  const config = stageConfig[progress.stage];
  const Icon = config.icon;
  const isAnimating =
    progress.stage !== "complete" &&
    progress.stage !== "error" &&
    progress.stage !== "idle";

  return (
    <div className="w-lg mx-auto p-12 bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-800">
      <div className="flex flex-col items-center space-y-8">
        <div className="relative">
          <div className="relative w-28 h-28 rounded-full bg-linear-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-700">
            <div
              className={`${config.color} ${isAnimating ? "animate-pulse" : ""}`}
            >
              <Icon
                className={`w-14 h-14 ${
                  isAnimating && progress.stage !== "model-download"
                    ? "animate-spin"
                    : ""
                }`}
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>

        <div className="text-center space-y-3 w-full">
          <h2 className={`text-2xl font-semibold ${config.color}`}>
            {config.label}
          </h2>
          <p className="text-gray-400 text-base min-h-6">{progress.message}</p>

          {progress.currentChunk !== undefined &&
            progress.totalChunks !== undefined && (
              <div
                className="mt-6 space-y-3"
                role="progressbar"
                aria-valuenow={progress.currentChunk}
                aria-valuemin={0}
                aria-valuemax={progress.totalChunks}
              >
                <div className="flex justify-between text-sm text-gray-400">
                  <span>
                    Chunk {progress.currentChunk} of {progress.totalChunks}
                  </span>
                  <span className="font-semibold">
                    {Math.round(
                      (progress.currentChunk / progress.totalChunks) * 100
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden border border-gray-700">
                  <div
                    className="h-full bg-linear-to-r from-orange-500 to-red-500 transition-all duration-300 ease-out shadow-lg"
                    style={{
                      width: `${
                        (progress.currentChunk / progress.totalChunks) * 100
                      }%`,
                      boxShadow: "0 0 10px rgba(249, 115, 22, 0.5)",
                    }}
                  />
                </div>
              </div>
            )}

          {progress.error && (
            <div
              className="mt-6 p-4 bg-red-950/50 border border-red-800/50 rounded-xl"
              role="alert"
            >
              <p className="text-red-300 text-sm">{progress.error}</p>
            </div>
          )}
        </div>

        <div
          className="flex space-x-2 pt-4 w-full px-4"
          aria-label="Processing stages"
        >
          {(
            [
              "model-init",
              "model-download",
              "audio-extraction",
              "audio-chunking",
              "transcription",
              "summarization",
              "knowledge-base-creation",
            ] as const
          ).map((stageKey, index, stages) => {
            const currentIndex = stages.indexOf(progress.stage as typeof stages[number]);
            const stageIndex = index;
            const isActive = stageIndex === currentIndex;
            const isComplete =
              stageIndex < currentIndex || progress.stage === "complete";

            return (
              <div
                key={stageKey}
                className={`h-2 flex-1 rounded-full transition-all duration-500 w-lg ${
                  isComplete
                    ? "bg-linear-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/30"
                    : isActive
                    ? "bg-linear-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-500/30"
                    : "bg-gray-800 border border-gray-700"
                }`}
                aria-label={stageConfig[stageKey].label}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
