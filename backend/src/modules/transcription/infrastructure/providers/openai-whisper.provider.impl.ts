import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFile, readFile, unlink } from 'fs/promises';
import { randomUUID } from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import OpenAI, { toFile } from 'openai';

if (ffmpegStatic) ffmpeg.setFfmpegPath(ffmpegStatic);
import type { ITranscriptionProvider, TranscriptionResult } from '../../domain/repositories/transcription.provider.js';

// Limite da API de áudio da OpenAI é 25MB — comprime acima de 24MB
const OPENAI_MAX_BYTES = 24 * 1024 * 1024;

@Injectable()
export class OpenAiWhisperProviderImpl implements ITranscriptionProvider {
  private readonly logger = new Logger(OpenAiWhisperProviderImpl.name);
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.getOrThrow<string>('OPENAI_API_KEY'),
    });
  }

  async transcribe(audioBuffer: Buffer, language = 'pt'): Promise<TranscriptionResult> {
    this.logger.log(`Transcribing with OpenAI Whisper | size=${(audioBuffer.length / 1024 / 1024).toFixed(1)}MB`);

    const buffer = audioBuffer.length > OPENAI_MAX_BYTES
      ? await this.compress(audioBuffer)
      : audioBuffer;

    this.logger.log(`Sending to OpenAI | size=${(buffer.length / 1024 / 1024).toFixed(1)}MB`);

    const file = await toFile(buffer, 'audio.mp3', { type: 'audio/mpeg' });

    const result = await this.openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
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
