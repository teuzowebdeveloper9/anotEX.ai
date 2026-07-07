import { ConfigService } from '@nestjs/config';
import { OpenAiWhisperProviderImpl } from './openai-whisper.provider.impl.js';

describe('OpenAiWhisperProviderImpl', () => {
  let provider: OpenAiWhisperProviderImpl;
  let configService: jest.Mocked<ConfigService>;
  let mockTranscribe: jest.Mock;

  beforeEach(() => {
    configService = {
      getOrThrow: jest.fn().mockReturnValue('fake-openai-key'),
    } as unknown as jest.Mocked<ConfigService>;

    mockTranscribe = jest.fn().mockResolvedValue({ text: 'Texto transcrito', segments: [] });

    provider = new OpenAiWhisperProviderImpl(configService);
    (provider as unknown as { openai: unknown }).openai = {
      audio: {
        transcriptions: {
          create: mockTranscribe,
        },
      },
    };
  });

  describe('transcribe', () => {
    it('deve chamar a OpenAI com o modelo correto', async () => {
      await provider.transcribe(Buffer.from('audio'), 'pt');

      expect(mockTranscribe).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'whisper-1',
          language: 'pt',
          response_format: 'verbose_json',
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
      mockTranscribe.mockResolvedValue({ text: 'Aula de física quântica', segments: [] });

      const result = await provider.transcribe(Buffer.from('audio'), 'pt');
      expect(result.text).toBe('Aula de física quântica');
    });

    it('deve mapear os segmentos removendo espaços do texto', async () => {
      mockTranscribe.mockResolvedValue({
        text: 'Aula de física quântica',
        segments: [
          { start: 0, end: 2.5, text: ' Aula de física ' },
          { start: 2.5, end: 4, text: ' quântica ' },
        ],
      });

      const result = await provider.transcribe(Buffer.from('audio'), 'pt');
      expect(result.segments).toEqual([
        { start: 0, end: 2.5, text: 'Aula de física' },
        { start: 2.5, end: 4, text: 'quântica' },
      ]);
    });

    it('deve retornar segmentos vazios quando a resposta não os inclui', async () => {
      mockTranscribe.mockResolvedValue({ text: 'Aula sem segmentos' });

      const result = await provider.transcribe(Buffer.from('audio'), 'pt');
      expect(result.segments).toEqual([]);
    });

    it('deve propagar erro da OpenAI', async () => {
      mockTranscribe.mockRejectedValue(new Error('Rate limit exceeded'));

      await expect(provider.transcribe(Buffer.from('audio'), 'pt')).rejects.toThrow(
        'Rate limit exceeded',
      );
    });
  });
});
