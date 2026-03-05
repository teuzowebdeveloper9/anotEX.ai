export class TranscriptionResponseDto {
  id!: string;
  audioId!: string;
  status!: string;
  transcriptionText!: string | null;
  summaryText!: string | null;
  language!: string;
  createdAt!: string;
}
