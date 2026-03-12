import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import type { IYouTubeProvider } from '../../domain/repositories/youtube.provider.js';
import type { FolderContext, YouTubeVideoResult } from '../../domain/entities/study-folder.entity.js';

const QUERY_PROMPT = `Você é um especialista em educação. Com base nas informações abaixo sobre uma pasta de estudos, gere uma query de busca para o YouTube que encontre vídeos educacionais complementares.

Pasta: {name}
Descrição: {description}
Conteúdo dos materiais:
{materials}

Gere APENAS a query de busca (máximo 10 palavras), no mesmo idioma do conteúdo. Não adicione explicações, aspas ou texto adicional.`;

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    description: string;
    thumbnails: { high?: { url: string }; default?: { url: string } };
  };
}

interface YouTubeSearchResponse {
  items?: YouTubeSearchItem[];
}

@Injectable()
export class YouTubeProviderImpl implements IYouTubeProvider {
  private readonly logger = new Logger(YouTubeProviderImpl.name);
  private readonly groq: Groq;
  private readonly youtubeApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.groq = new Groq({
      apiKey: this.configService.getOrThrow<string>('GROQ_API_KEY'),
    });
    this.youtubeApiKey = this.configService.getOrThrow<string>('YOUTUBE_API_KEY');
  }

  async getRecommendations(context: FolderContext): Promise<YouTubeVideoResult[]> {
    const query = await this.generateSearchQuery(context);
    this.logger.log(`YouTube search query: "${query}"`);
    return this.searchYouTube(query);
  }

  private async generateSearchQuery(context: FolderContext): Promise<string> {
    const materialsText = context.materials
      .map((m, i) => `[${i + 1}] ${m.slice(0, 300)}`)
      .join('\n\n');

    const prompt = QUERY_PROMPT.replace('{name}', context.folderName)
      .replace('{description}', context.folderDescription ?? 'Não informada')
      .replace('{materials}', materialsText);

    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 50,
    });

    return (completion.choices[0]?.message?.content ?? context.folderName).trim();
  }

  private async searchYouTube(query: string): Promise<YouTubeVideoResult[]> {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', query);
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', '5');
    url.searchParams.set('videoCategoryId', '27'); // Education category
    url.searchParams.set('key', this.youtubeApiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as YouTubeSearchResponse;

    return (data.items ?? []).map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail:
        item.snippet.thumbnails.high?.url ??
        item.snippet.thumbnails.default?.url ??
        '',
      publishedAt: item.snippet.publishedAt,
      description: item.snippet.description,
    }));
  }
}
