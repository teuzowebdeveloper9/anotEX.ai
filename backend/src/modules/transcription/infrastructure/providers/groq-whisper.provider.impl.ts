import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFile, readFile, unlink } from 'fs/promises';
import { randomUUID } from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import Groq from 'groq-sdk';

// Usa o binário estático incluso no pacote (funciona em qualquer ambiente, incluindo Railway)
if (ffmpegStatic) ffmpeg.setFfmpegPath(ffmpegStatic);
import type { ITranscriptionProvider, TranscriptionResult } from '../../domain/repositories/transcription.provider.js';
import { toFile } from 'openai';

const GROQ_MAX_BYTES = 24 * 1024 * 1024; // 24MB safe threshold

@Injectable()
export class GroqWhisperProviderImpl implements ITranscriptionProvider {
  private readonly logger = new Logger(GroqWhisperProviderImpl.name);
  private readonly groq: Groq;

  constructor(private readonly configService: ConfigService) {
    this.groq = new Groq({
      apiKey: this.configService.getOrThrow<string>('GROQ_API_KEY'),
    });
  }

  async transcribe(audioBuffer: Buffer, language = 'pt'): Promise<TranscriptionResult> {
    this.logger.log(`Transcribing with Groq Whisper | size=${(audioBuffer.length / 1024 / 1024).toFixed(1)}MB`);

    const buffer = audioBuffer.length > GROQ_MAX_BYTES
      ? await this.compress(audioBuffer)
      : audioBuffer;

    this.logger.log(`Sending to Groq | size=${(buffer.length / 1024 / 1024).toFixed(1)}MB`);

    const file = await toFile(buffer, 'audio.mp3', { type: 'audio/mpeg' });

    const result = await this.groq.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3',
      language,
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    }) as unknown as { text: string; segments?: Array<{ start: number; end: number; text: string }> };

    return {
      text: result.text,
      segments: (result.segments ?? []).map((s) => ({
        start: s.start,
        end: s.end,
        text: s.text.trim(),
      })),
    };
  }

  private async compress(input: Buffer): Promise<Buffer> {
    this.logger.log(`Compressing audio to MP3 64kbps | ${(input.length / 1024 / 1024).toFixed(1)}MB`);

    const id = randomUUID();
    const inputPath = join(tmpdir(), `anotex-in-${id}`);
    const outputPath = join(tmpdir(), `anotex-out-${id}.mp3`);

    await writeFile(inputPath, input);

    try {
      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .audioCodec('libmp3lame')
          .audioBitrate('64k')
          .audioChannels(1)
          .audioFrequency(16000)
          .format('mp3')
          .on('error', (err) => reject(new Error(`ffmpeg error: ${err.message}`)))
          .on('end', () => resolve())
          .save(outputPath);
      });

      const compressed = await readFile(outputPath);
      this.logger.log(`Compression done | ${(input.length / 1024 / 1024).toFixed(1)}MB → ${(compressed.length / 1024 / 1024).toFixed(1)}MB`);
      return compressed;
    } finally {
      await unlink(inputPath).catch(() => undefined);
      await unlink(outputPath).catch(() => undefined);
    }
  }
}
