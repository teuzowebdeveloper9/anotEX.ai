import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import type { IChatProvider, ChatHistoryMessage } from '../../domain/repositories/chat.provider.js';

@Injectable()
export class GroqChatProviderImpl implements IChatProvider {
  private readonly logger = new Logger(GroqChatProviderImpl.name);
  private readonly groq: Groq;

  constructor(private readonly configService: ConfigService) {
    this.groq = new Groq({
      apiKey: this.configService.getOrThrow<string>('GROQ_API_KEY'),
    });
  }

  async *streamResponse(
    systemPrompt: string,
    history: ChatHistoryMessage[],
    userMessage: string,
  ): AsyncIterable<string> {
    this.logger.log('Streaming chat response from Groq Llama 3.3 70B...');

    const stream = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userMessage },
      ],
      stream: true,
      temperature: 0.3,
      max_tokens: 1024,
    });

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content;
      if (token) yield token;
    }
  }
}
