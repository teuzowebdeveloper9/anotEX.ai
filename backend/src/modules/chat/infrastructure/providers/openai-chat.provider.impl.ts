import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { IChatProvider, ChatHistoryMessage } from '../../domain/repositories/chat.provider.js';

@Injectable()
export class OpenAiChatProviderImpl implements IChatProvider {
  private readonly logger = new Logger(OpenAiChatProviderImpl.name);
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.getOrThrow<string>('OPENAI_API_KEY'),
    });
  }

  async *streamResponse(
    systemPrompt: string,
    history: ChatHistoryMessage[],
    userMessage: string,
  ): AsyncIterable<string> {
    this.logger.log('Streaming chat response from OpenAI gpt-4o-mini...');

    const stream = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
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
