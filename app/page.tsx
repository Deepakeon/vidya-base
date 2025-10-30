"use client"
import { AUDIO_CHUNKS_PER_SESSION, GeminiNano } from "@/services/llm/GeminiNano";
import { getAudioExtractor } from "@/services/media/AudioExtractor";
import { useEffect, useState } from "react";

export default function Home() {
  const [output, setOutput] = useState("");
  const llm = new GeminiNano();

  const handleClick = async (e) => {
    const service = getAudioExtractor()
    const start = performance.now()
    await service.initialize()
    const chunkToTranscribe = await service.extractAndChunk(Array.from(e.target.files)[0] as File)
    await llm.createSession(Math.ceil((chunkToTranscribe?.length ?? 0) / AUDIO_CHUNKS_PER_SESSION))
    const payload = []
    for (let i = 0; i < (chunkToTranscribe?.length ?? 0) + AUDIO_CHUNKS_PER_SESSION; i += AUDIO_CHUNKS_PER_SESSION) {
      payload.push({
        audio: chunkToTranscribe?.slice(i, i + AUDIO_CHUNKS_PER_SESSION)
      })
    }
    await llm.runPromptsInParallel(payload)
    const end = performance.now()
    console.log(`Model initialization took ${(end - start).toFixed(2)} ms`)
    // const url = URL.createObjectURL(chunkToTranscribe[0]);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = "chunk";
    // a.click();
  };

  useEffect(() => {
    llm.initialize()
  }, [])

  return (
    <div className="p-4">
      <input
        type="file"
        onChange={handleClick}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      />

      {output && <p className="mt-3 whitespace-pre-wrap">{output}</p>}
    </div>
  );
}
