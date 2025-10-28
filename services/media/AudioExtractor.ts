import { FFmpeg, LogEvent } from '@ffmpeg/ffmpeg';
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

    async extractAudio(videoFile: File) {
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

        } catch (error) {
            console.log(error)
        }
    }

    async getAudioDuration(fileName: string): Promise<number> {
        if (!this.ffmpeg || !this.loaded) {
            throw new Error('FFmpeg not initialized. Call initialize() first.');
        }
        let duration = 0;

        return new Promise(async (resolve) => {
            const onLog = ({ message }: LogEvent) => {
                const match = message.match(/Duration:\s(\d+):(\d+):([\d.]+)/);
                if (match) {
                    const [, h, m, s] = match;
                    duration = parseFloat(h) * 3600 + parseFloat(m) * 60 + parseFloat(s);
                }
            };

            this.ffmpeg?.on('log', onLog);

            await this.ffmpeg?.exec(['-i', fileName, '-f', 'null', '-']);

            this.ffmpeg?.off('log', onLog);
            resolve(duration || 300);
        });
    }

    async chunkAudioFromAssembly(fileName: string, chunkSeconds = 0.1) {
        if (!this.ffmpeg || !this.loaded) {
            throw new Error('FFmpeg not initialized. Call initialize() first.');
        }

        const duration = await this.getAudioDuration(fileName);
        const chunks = [];
        let start = 0;
        let index = 0;

        while (start < duration) {
            const output = `chunk_${index}.wav`;

            await this.ffmpeg.exec([
                '-i', fileName,
                '-ss', `${start}`,
                '-t', `${chunkSeconds}`,
                '-acodec', 'copy',
                output
            ]);

            const data = await this.ffmpeg.readFile(output);
            const blob = new Blob([data.buffer], { type: 'audio/mpeg' });
            chunks.push(blob);

            start += chunkSeconds;
            index++;
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