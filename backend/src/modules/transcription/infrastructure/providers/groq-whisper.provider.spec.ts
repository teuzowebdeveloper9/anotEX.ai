import { ConfigService } from '@nestjs/config';
import { GroqWhisperProviderImpl } from './groq-whisper.provider.impl.js';

describe('GroqWhisperProviderImpl', () => {
  let provider: GroqWhisperProviderImpl;
  let configService: jest.Mocked<ConfigService>;
  let mockTranscribe: jest.Mock;

  beforeEach(() => {
    configService = {
      getOrThrow: jest.fn().mockReturnValue('fake-groq-key'),
    } as unknown as jest.Mocked<ConfigService>;

    mockTranscribe = jest.fn().mockResolvedValue('Texto transcrito');

    provider = new GroqWhisperProviderImpl(configService);
    (provider as unknown as { groq: unknown }).groq = {
      audio: {
        transcriptions: {
          create: mockTranscribe,
        },
      },
    };
  });

  describe('transcribe', () => {
    it('deve chamar Groq com o modelo correto', async () => {
      await provider.transcribe(Buffer.from('audio'), 'pt');

      expect(mockTranscribe).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'whisper-large-v3',
          language: 'pt',
          response_format: 'text',
        }),
      );
    });

    it('deve usar pt como idioma padrão', async () => {
      await provider.transcribe(Buffer.from('audio'));

      expect(mockTranscribe).toHaveBeenCalledWith(
        expect.objectContaining({ language: 'pt' }),
      );
    });

    it('deve retornar o texto transcrito', async () => {
      mockTranscribe.mockResolvedValue('Aula de física quântica');

      const result = await provider.transcribe(Buffer.from('audio'), 'pt');
      expect(result).toBe('Aula de física quântica');
    });

    it('deve propagar erro do Groq', async () => {
      mockTranscribe.mockRejectedValue(new Error('Rate limit exceeded'));

      await expect(provider.transcribe(Buffer.from('audio'), 'pt')).rejects.toThrow(
        'Rate limit exceeded',
      );
    });
  });
});
