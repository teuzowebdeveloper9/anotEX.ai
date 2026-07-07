import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ISummaryProvider } from '../../domain/repositories/transcription.provider.js';

const SUMMARY_PROMPT = `Você é um assistente especializado em resumir aulas.
Analise a transcrição a seguir e crie um resumo estruturado com:
1. Tópicos principais abordados
2. Conceitos-chave explicados
3. Pontos importantes para revisão

Seja conciso e objetivo. Responda em português.

Transcrição:`;

const TITLE_PROMPT = `Leia a transcrição a seguir e crie um título curto (máximo 8 palavras) que descreva o tema principal da aula. Responda APENAS com o título, sem aspas, sem pontuação final, sem explicação.

Transcrição:`;

@Injectable()
export class OpenAiGptProviderImpl implements ISummaryProvider {
  private readonly logger = new Logger(OpenAiGptProviderImpl.name);
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.getOrThrow<string>('OPENAI_API_KEY'),
    });
  }

  async summarize(transcriptionText: string): Promise<string> {
    this.logger.log('Summarizing with OpenAI gpt-4o-mini...');

    // gpt-4o-mini tem contexto de 128k tokens — 100k chars cobre aulas longas com folga
    const truncated = transcriptionText.slice(0, 100_000);

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `${SUMMARY_PROMPT}\n\n${truncated}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content ?? '';
  }

  async generateTitle(transcriptionText: string): Promise<string> {
    this.logger.log('Generating title with OpenAI gpt-4o-mini...');

    const preview = transcriptionText.slice(0, 1500);

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `${TITLE_PROMPT}\n\n${preview}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 32,
    });

    return (completion.choices[0]?.message?.content ?? '').trim();
  }
}
