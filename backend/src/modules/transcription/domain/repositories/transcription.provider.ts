export interface TranscriptionResult {
  text: string;
  segments: Array<{ start: number; end: number; text: string }>;
}

export interface ITranscriptionProvider {
  transcribe(audioBuffer: Buffer, language?: string): Promise<TranscriptionResult>;
}

export interface ISummaryProvider {
  summarize(transcriptionText: string): Promise<string>;
  generateTitle(transcriptionText: string): Promise<string>;
}

export const TRANSCRIPTION_PROVIDER = Symbol('ITranscriptionProvider');
export const SUMMARY_PROVIDER = Symbol('ISummaryProvider');
