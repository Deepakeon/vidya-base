"use client"
import { useState, useEffect } from 'react';
import { AlertCircle, Video } from 'lucide-react';
import { VideoUpload } from '@/components/VideoUpload';
import { KnowledgeBase as KnowledgeBaseType, ProcessedChunk, ProcessingProgress } from '@/types';
import { AUDIO_CHUNKS_PER_SESSION, GeminiNano } from '@/services/llm/GeminiNano';
import { ProcessingAnimation } from '@/components/ProcessingAnimation';
import { AudioExtractor } from '@/services/media/AudioExtractor';
import { KnowledgeBase } from '@/components/KnowledgeBase';
import { PROMPT_CHUNK_SUMMARY, PROMPT_KB_SYNTHESIS } from '@/services/llm/prompt';

function App() {
  const gemini = new GeminiNano()
  const audioExtractor = new AudioExtractor()
  const [progress, setProgress] = useState<ProcessingProgress>({
    stage: 'idle',
    message: 'Ready to process your video',
  });
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [browserSupported, setBrowserSupported] = useState<boolean>(false);

  useEffect(() => {
    const checkBrowser = async () => {
      const { available } = await gemini.checkAvailability();
      setBrowserSupported(available);
    };
    checkBrowser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVideoSelect = async (videoFile: File) => {
    setIsProcessing(true);
    setKnowledgeBase(null);

    try {
      setProgress({
        stage: 'model-init',
        message: 'Checking AI model availability...',
      });

      const { available } = await gemini.checkAvailability();

      if (!available) {
        throw new Error('Gemini Nano is not available in this browser');
      }

      setProgress({
        stage: 'audio-extraction',
        message: 'Extracting audio from video and chunking audio...',
      });

      await audioExtractor.initialize()
      const audioChunks = await audioExtractor.extractAndChunk(videoFile)

      setProgress({
        stage: 'transcription',
        message: 'Processing segments...',
        currentChunk: 0,
        totalChunks: audioChunks?.length,
      });

      const processedChunks: ProcessedChunk[] = [];
      await gemini.createSession(Math.ceil((audioChunks?.length ?? 0) / AUDIO_CHUNKS_PER_SESSION), [{
        role: "system",
        content: PROMPT_CHUNK_SUMMARY
    }],(progress) => {
        setProgress({
          stage: 'model-download',
          message: `Downloading AI model... (${progress}%)`,
        });
      });
      const payload = []
      for (let i = 0; i < (audioChunks?.length ?? 0); i += AUDIO_CHUNKS_PER_SESSION) {
        payload.push({
          audio: audioChunks?.slice(i, i + AUDIO_CHUNKS_PER_SESSION)
        })
      }
      const summaries = (await gemini.runPromptsInParallel(payload, {}, (completed) => {
        setProgress({
          stage: 'transcription',
          message: `Processing chunks (This may take a while)... (${completed}/${audioChunks?.length ?? 0})`,
          currentChunk: completed,
          totalChunks: audioChunks?.length ?? 0,
        });
      })).join("\n\n")
      setProgress({
        stage: 'knowledge-base-creation',
        message: 'Generating topics and organizing knowledge base...',
      });

      const knowledgeBase = await gemini.generate({ text: PROMPT_KB_SYNTHESIS.replace("{{SUMMARIES}}", summaries) })

      const kb: KnowledgeBaseType = {
        videoName: videoFile.name,
        processedAt: new Date(),
        chunks: processedChunks,
        text: knowledgeBase,
      };
      console.log(kb)
      setKnowledgeBase(kb);

      setProgress({
        stage: 'complete',
        message: 'Knowledge base created successfully!',
      });
    } catch (error) {
      console.error('Processing error:', error);
      setProgress({
        stage: 'error',
        message: 'An error occurred during processing',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setKnowledgeBase(null);
    setProgress({
      stage: 'idle',
      message: 'Ready to process your video',
    });
  };

  if (!browserSupported) {
    return (

      <div className="min-h-screen bg-neutral-950 text-gray-100 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-neutral-900/50 backdrop-blur-sm rounded-xl p-10 border border-neutral-800/50 shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full"></div>
              <AlertCircle className="w-20 h-20 text-orange-500 relative z-10" strokeWidth={1.5} />
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-semibold text-white tracking-tight">Browser Not Supported</h1>
              <p className="text-base text-gray-400 leading-relaxed max-w-md">
                This application requires the latest version of Google Chrome with Gemini Nano API support.
              </p>
            </div>

            <div className="pt-4 pb-2">
              <p className="text-sm text-gray-500 leading-relaxed">
                Please update to the latest version of Chrome and ensure experimental AI features are enabled.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-neutral-950 text-gray-100 flex flex-col">
      <header className="border-b border-neutral-800/50 sticky top-0 z-10 bg-neutral-950/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white tracking-tight">
                VidyaBase
              </h1>
            </div>
            <p className="hidden sm:block text-sm text-gray-500">
              On-device AI processing
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-auto">
        {!knowledgeBase && progress.stage === 'idle' && (
          <VideoUpload onVideoSelect={handleVideoSelect} disabled={isProcessing} />
        )}

        {isProcessing || (progress.stage !== 'idle' && progress.stage !== 'complete') ? (
          <ProcessingAnimation progress={progress} />
        ) : null}

        {knowledgeBase && progress.stage === 'complete' && (
          <KnowledgeBase knowledgeBase={knowledgeBase} onReset={handleReset} />
        )}

        {progress.stage === 'error' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-600/10 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-white mb-2">Processing Error</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">{progress.error}</p>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm rounded-lg transition-colors font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-neutral-800/50 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-xs text-gray-600">
            Privacy-first processing • All AI inference happens locally on your device
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
