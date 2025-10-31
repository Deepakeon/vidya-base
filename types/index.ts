export interface ProcessedChunk {
  id: string;
  startTime: number;
  endTime: number;
  transcription: string;
  summary: string;
}

export interface KnowledgeBase {
  videoName: string;
  processedAt: Date;
  chunks: ProcessedChunk[];
  text: string;
}

export type ProcessingStage =
  | 'idle'
  | 'model-init'
  | 'model-download'
  | 'audio-extraction'
  | 'audio-chunking'
  | 'transcription'
  | 'summarization'
  | 'knowledge-base-creation'
  | 'complete'
  | 'error';

export interface ProcessingProgress {
  stage: ProcessingStage;
  currentChunk?: number;
  totalChunks?: number;
  message: string;
  error?: string;
}
