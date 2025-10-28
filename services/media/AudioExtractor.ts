import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export interface AudioChunk {
    blob: Blob;
    startTime: number;
    endTime: number;
    index: number;
}

export class AudioExtractor {
    private ffmpeg: FFmpeg | null = null;
    private loaded = false;

    async initialize(): Promise<void> {
        if (this.loaded) return;

        if (this.loaded) return;
        this.ffmpeg = new FFmpeg()
        const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd'
        this.ffmpeg.on('log', ({ message }) => {
            console.log(message);
        });
        await this.ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        this.loaded = true
    }

    async extractAudio(videoFile: File): Promise<Blob | undefined> {
        if (!this.ffmpeg || !this.loaded) {
            throw new Error('FFmpeg not initialized. Call initialize() first.');
        }

        try {
            await this.ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

            await this.ffmpeg.exec([
                '-i', 'input.mp4',
                '-vn',
                '-acodec', 'pcm_s16le', // Raw uncompressed PCM
                '-ar', '44100',
                '-ac', '2',
                'output.wav'
            ]);

            const data = await this.ffmpeg.readFile('output.wav');
            await this.ffmpeg.deleteFile('input.mp4');
            await this.ffmpeg.deleteFile('output.wav');
            if (data) return new Blob([data], { type: "audio/mpeg" });
        } catch (error) {
            console.log(error)
        }
    }
}

let audioExtractorInstance: AudioExtractor | null = null;

export function getAudioExtractor(): AudioExtractor {
    if (!audioExtractorInstance) {
        audioExtractorInstance = new AudioExtractor();
    }
    return audioExtractorInstance;
}