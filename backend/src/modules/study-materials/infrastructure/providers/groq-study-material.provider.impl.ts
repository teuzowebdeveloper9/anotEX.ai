import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import type { IStudyMaterialProvider } from '../../domain/repositories/study-material.provider.js';
import type {
  FlashcardItem,
  MindmapContent,
  QuizItem,
} from '../../domain/entities/study-material.entity.js';

const FLASHCARD_PROMPT = `Você é um especialista em técnicas de estudo e memorização.
Analise o resumo da aula abaixo e crie entre 15 e 20 flashcards de estudo em português.

Regras:
- Frente: pergunta ou conceito curto e direto
- Verso: resposta completa mas concisa
- Cubra os principais conceitos do resumo
- Varie a dificuldade (easy, medium, hard)
- Agrupe por tópico quando possível

Retorne APENAS um JSON array válido, sem texto adicional, no formato:
[{"front":"...","back":"...","difficulty":"easy|medium|hard","topic":"..."}]

Resumo da aula:`;

const MINDMAP_PROMPT = `Você é especialista em organização de conhecimento.
Analise o resumo da aula abaixo e crie um mapa mental em formato Markmap (Markdown).

Regras:
- Use # para o tema principal (apenas 1)
- Use ## para os tópicos principais (3 a 6)
- Use ### para subtópicos
- Use - para detalhes específicos
- Máximo 3 níveis de profundidade
- Seja conciso: apenas palavras-chave e frases curtas
- Retorne APENAS o markdown, sem explicações

Resumo da aula:`;

const QUIZ_PROMPT = `Você é um professor especialista em avaliação de aprendizagem.
Analise o resumo da aula abaixo e crie 10 questões de múltipla escolha em português.

Regras:
- Cada questão deve ter exatamente 4 alternativas
- Apenas 1 alternativa correta
- O campo "correct" é o índice (0, 1, 2 ou 3) da alternativa correta
- Inclua uma explicação breve da resposta correta
- Varie o nível de dificuldade

Retorne APENAS um JSON array válido, sem texto adicional, no formato:
[{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]

Resumo da aula:`;

@Injectable()
export class GroqStudyMaterialProviderImpl implements IStudyMaterialProvider {
  private readonly logger = new Logger(GroqStudyMaterialProviderImpl.name);
  private readonly groq: Groq;

  constructor(private readonly configService: ConfigService) {
    this.groq = new Groq({
      apiKey: this.configService.getOrThrow<string>('GROQ_API_KEY'),
    });
  }

  async generateFlashcards(summaryText: string): Promise<FlashcardItem[]> {
    this.logger.log('Generating flashcards...');
    const raw = await this.callGroq(`${FLASHCARD_PROMPT}\n\n${summaryText}`, 2048);
    const parsed = this.parseJsonArray<FlashcardItem>(raw);

    return parsed.filter(
      (item) =>
        typeof item.front === 'string' &&
        typeof item.back === 'string' &&
        ['easy', 'medium', 'hard'].includes(item.difficulty),
    );
  }

  async generateMindmap(summaryText: string): Promise<MindmapContent> {
    this.logger.log('Generating mindmap...');
    const markdown = await this.callGroq(`${MINDMAP_PROMPT}\n\n${summaryText}`, 1024);
    return { markdown: markdown.trim() };
  }

  async generateQuiz(summaryText: string): Promise<QuizItem[]> {
    this.logger.log('Generating quiz...');
    const raw = await this.callGroq(`${QUIZ_PROMPT}\n\n${summaryText}`, 2048);
    const parsed = this.parseJsonArray<QuizItem>(raw);

    return parsed.filter(
      (item) =>
        typeof item.question === 'string' &&
        Array.isArray(item.options) &&
        item.options.length === 4 &&
        [0, 1, 2, 3].includes(item.correct),
    );
  }

  private async callGroq(prompt: string, maxTokens: number): Promise<string> {
    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: maxTokens,
    });

    return completion.choices[0]?.message?.content ?? '';
  }

  private parseJsonArray<T>(text: string): T[] {
    // Tentativa 1: parse direto
    try {
      const result = JSON.parse(text);
      if (Array.isArray(result)) return result as T[];
    } catch {
      // continua
    }

    // Tentativa 2: extrai o array com regex (LLM às vezes adiciona texto antes/depois)
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const result = JSON.parse(match[0]);
        if (Array.isArray(result)) return result as T[];
      } catch {
        // continua
      }
    }

    throw new Error(`Could not parse JSON array from LLM response: ${text.slice(0, 200)}`);
  }
}
