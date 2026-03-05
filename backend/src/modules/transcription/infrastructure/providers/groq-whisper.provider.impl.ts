import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { ITranscriptionProvider } from '../../domain/repositories/transcription.provider.js';
import { toFile } from 'openai';

@Injectable()
export class GroqWhisperProviderImpl implements ITranscriptionProvider {
  private readonly logger = new Logger(GroqWhisperProviderImpl.name);
  private readonly groq: Groq;

  constructor(private readonly configService: ConfigService) {
    this.groq = new Groq({
      apiKey: this.configService.getOrThrow<string>('GROQ_API_KEY'),
    });
  }

  async transcribe(audioBuffer: Buffer, language = 'pt'): Promise<string> {
    this.logger.log('Transcribing with Groq Whisper...');

    const file = await toFile(audioBuffer, 'audio.webm', { type: 'audio/webm' });

    const result = await this.groq.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3',
      language,
      response_format: 'text',
    });

    return result as unknown as string;
  }
}
