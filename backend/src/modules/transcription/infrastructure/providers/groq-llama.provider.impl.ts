import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { ISummaryProvider } from '../../domain/repositories/transcription.provider.js';

const SUMMARY_PROMPT = `Você é um assistente especializado em resumir aulas.
Analise a transcrição a seguir e crie um resumo estruturado com:
1. Tópicos principais abordados
2. Conceitos-chave explicados
3. Pontos importantes para revisão

Seja conciso e objetivo. Responda em português.

Transcrição:`;

@Injectable()
export class GroqLlamaProviderImpl implements ISummaryProvider {
  private readonly logger = new Logger(GroqLlamaProviderImpl.name);
  private readonly groq: Groq;

  constructor(private readonly configService: ConfigService) {
    this.groq = new Groq({
      apiKey: this.configService.getOrThrow<string>('GROQ_API_KEY'),
    });
  }

  async summarize(transcriptionText: string): Promise<string> {
    this.logger.log('Summarizing with Groq Llama 3 70B...');

    const completion = await this.groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages: [
        {
          role: 'user',
          content: `${SUMMARY_PROMPT}\n\n${transcriptionText}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content ?? '';
  }
}
