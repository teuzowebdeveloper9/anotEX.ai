import { Injectable } from '@nestjs/common';

const CHUNK_SIZE_WORDS = 380;   // ≈ 500 tokens
const OVERLAP_WORDS = 38;       // ≈ 50 tokens
const TOP_N_CHUNKS = 8;

@Injectable()
export class TfIdfHelper {
  selectTopChunks(query: string, text: string, topN = TOP_N_CHUNKS): string[] {
    const chunks = this.buildChunks(text);
    if (chunks.length === 0) return [];

    const queryTerms = this.tokenize(query);
    const scores = chunks.map(chunk => this.score(queryTerms, chunk));

    return chunks
      .map((chunk, i) => ({ chunk, score: scores[i] }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topN)
      .map(({ chunk }) => chunk);
  }

  private buildChunks(text: string): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    let i = 0;

    while (i < words.length) {
      const end = Math.min(i + CHUNK_SIZE_WORDS, words.length);
      chunks.push(words.slice(i, end).join(' '));
      i += CHUNK_SIZE_WORDS - OVERLAP_WORDS;
    }

    return chunks;
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-záéíóúâêîôûãõçàü\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2);
  }

  private score(queryTerms: string[], chunk: string): number {
    const chunkTerms = this.tokenize(chunk);
    const total = chunkTerms.length || 1;

    // Term frequency for each query term in this chunk
    return queryTerms.reduce((acc, term) => {
      const count = chunkTerms.filter(t => t === term).length;
      return acc + count / total;
    }, 0);
  }
}
