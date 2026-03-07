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

const TITLE_PROMPT = `Leia a transcrição a seguir e crie um título curto (máximo 8 palavras) que descreva o tema principal da aula. Responda APENAS com o título, sem aspas, sem pontuação final, sem explicação.

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
      model: 'llama-3.3-70b-versatile',
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

  async generateTitle(transcriptionText: string): Promise<string> {
    this.logger.log('Generating title with Groq Llama 3 70B...');

    const preview = transcriptionText.slice(0, 1500);

    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
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
