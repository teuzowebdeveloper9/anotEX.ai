export interface ITranscriptionProvider {
  transcribe(audioBuffer: Buffer, language?: string): Promise<string>;
}

export interface ISummaryProvider {
  summarize(transcriptionText: string): Promise<string>;
  generateTitle(transcriptionText: string): Promise<string>;
}

export const TRANSCRIPTION_PROVIDER = Symbol('ITranscriptionProvider');
export const SUMMARY_PROVIDER = Symbol('ISummaryProvider');
