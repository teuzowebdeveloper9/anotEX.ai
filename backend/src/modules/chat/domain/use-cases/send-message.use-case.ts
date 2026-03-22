import { Inject, Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import type { IChatRepository } from '../repositories/chat.repository.js';
import { CHAT_REPOSITORY } from '../repositories/chat.repository.js';
import type { IChatProvider } from '../repositories/chat.provider.js';
import { CHAT_PROVIDER } from '../repositories/chat.provider.js';
import type { ITranscriptionRepository } from '../../../transcription/domain/repositories/transcription.repository.js';
import { TRANSCRIPTION_REPOSITORY } from '../../../transcription/domain/repositories/transcription.repository.js';
import { TranscriptionStatus } from '../../../transcription/domain/entities/transcription.entity.js';
import { TokenEstimatorHelper } from '../../infrastructure/helpers/token-estimator.helper.js';
import { TfIdfHelper } from '../../infrastructure/helpers/tfidf.helper.js';

const SYSTEM_PROMPT_FULL = `Você é um assistente de estudos especializado. Sua função é ajudar o aluno a entender o conteúdo de uma aula.

REGRAS OBRIGATÓRIAS:
1. Responda APENAS com base na transcrição fornecida abaixo
2. Se a informação NÃO estiver na transcrição, diga explicitamente: "Esse assunto não foi abordado nesta aula"
3. Nunca invente exemplos, datas, nomes ou conceitos que não estejam na transcrição
4. Quando citar algo da transcrição, indique que é da aula: "Conforme explicado na aula..."
5. Seja didático e claro — adapte a linguagem para um estudante
6. Responda em português

TRANSCRIÇÃO DA AULA:
{transcription}`;

const SYSTEM_PROMPT_CHUNKS = `Você é um assistente de estudos especializado. Sua função é ajudar o aluno a entender o conteúdo de uma aula.

REGRAS OBRIGATÓRIAS:
1. Responda APENAS com base nos trechos da transcrição fornecidos abaixo
2. Se a informação não estiver nos trechos, diga: "Esse assunto pode não ter sido abordado nesta aula"
3. Nunca invente conteúdo
4. Responda em português

TRECHOS RELEVANTES DA TRANSCRIÇÃO:
{transcription}`;

const FULL_CONTEXT_TOKEN_LIMIT = 50_000;

export interface SendMessageInput {
  transcriptionId: string;
  userId: string;
  userMessage: string;
}

@Injectable()
export class SendMessageUseCase {
  private readonly logger = new Logger(SendMessageUseCase.name);

  constructor(
    @Inject(CHAT_REPOSITORY) private readonly chatRepository: IChatRepository,
    @Inject(TRANSCRIPTION_REPOSITORY) private readonly transcriptionRepository: ITranscriptionRepository,
    @Inject(CHAT_PROVIDER) private readonly chatProvider: IChatProvider,
    private readonly tokenEstimator: TokenEstimatorHelper,
    private readonly tfidf: TfIdfHelper,
  ) {}

  async *execute(input: SendMessageInput): AsyncIterable<string> {
    const transcription = await this.transcriptionRepository.findById(input.transcriptionId);

    if (!transcription) {
      throw new NotFoundException('Transcrição não encontrada');
    }

    if (transcription.userId !== input.userId) {
      throw new ForbiddenException('Acesso negado');
    }

    if (transcription.status !== TranscriptionStatus.COMPLETED) {
      throw new BadRequestException('Transcrição ainda não concluída');
    }

    if (!transcription.transcriptionText) {
      throw new BadRequestException('Transcrição sem conteúdo');
    }

    const history = await this.chatRepository.getHistory(input.transcriptionId, input.userId, 10);

    const estimatedTokens = this.tokenEstimator.estimate(transcription.transcriptionText);
    let contextText: string;

    if (estimatedTokens <= FULL_CONTEXT_TOKEN_LIMIT) {
      contextText = transcription.transcriptionText;
      this.logger.log(`Chat: full context (~${estimatedTokens} tokens)`);
    } else {
      const chunks = this.tfidf.selectTopChunks(input.userMessage, transcription.transcriptionText);
      contextText = chunks.join('\n\n---\n\n');
      this.logger.log(`Chat: chunking mode (~${estimatedTokens} tokens), selected ${chunks.length} chunks`);
    }

    const promptTemplate = estimatedTokens <= FULL_CONTEXT_TOKEN_LIMIT
      ? SYSTEM_PROMPT_FULL
      : SYSTEM_PROMPT_CHUNKS;
    const systemPrompt = promptTemplate.replace('{transcription}', contextText);

    await this.chatRepository.saveMessage({
      transcriptionId: input.transcriptionId,
      userId: input.userId,
      role: 'user',
      content: input.userMessage,
    });

    const chatHistory = history.map(m => ({ role: m.role, content: m.content }));

    let fullResponse = '';
    for await (const token of this.chatProvider.streamResponse(systemPrompt, chatHistory, input.userMessage)) {
      fullResponse += token;
      yield token;
    }

    await this.chatRepository.saveMessage({
      transcriptionId: input.transcriptionId,
      userId: input.userId,
      role: 'assistant',
      content: fullResponse,
    });
  }
}
