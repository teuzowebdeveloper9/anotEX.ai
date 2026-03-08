import { ConfigService } from '@nestjs/config';
import { GroqLlamaProviderImpl } from './groq-llama.provider.impl.js';

describe('GroqLlamaProviderImpl', () => {
  let provider: GroqLlamaProviderImpl;
  let configService: jest.Mocked<ConfigService>;
  let mockCreate: jest.Mock;

  beforeEach(() => {
    configService = {
      getOrThrow: jest.fn().mockReturnValue('fake-groq-key'),
    } as unknown as jest.Mocked<ConfigService>;

    mockCreate = jest.fn().mockResolvedValue({
      choices: [{ message: { content: 'Resumo gerado' } }],
    });

    provider = new GroqLlamaProviderImpl(configService);
    (provider as unknown as { groq: unknown }).groq = {
      chat: { completions: { create: mockCreate } },
    };
  });

  describe('summarize', () => {
    it('deve chamar Groq com o modelo correto', async () => {
      await provider.summarize('Texto longo da aula...');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.3,
          max_tokens: 1024,
        }),
      );
    });

    it('deve incluir o texto da transcrição no prompt', async () => {
      const text = 'Hoje vamos estudar integrais';
      await provider.summarize(text);

      const call = mockCreate.mock.calls[0][0];
      expect(call.messages[0].content).toContain(text);
    });

    it('deve retornar o resumo gerado', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: '1. Tópico A\n2. Tópico B' } }],
      });

      const result = await provider.summarize('Aula de matemática');
      expect(result).toBe('1. Tópico A\n2. Tópico B');
    });

    it('deve retornar string vazia se choices estiver vazio', async () => {
      mockCreate.mockResolvedValue({ choices: [] });

      const result = await provider.summarize('Aula');
      expect(result).toBe('');
    });

    it('deve propagar erro do Groq', async () => {
      mockCreate.mockRejectedValue(new Error('API error'));

      await expect(provider.summarize('Texto')).rejects.toThrow('API error');
    });
  });
});
