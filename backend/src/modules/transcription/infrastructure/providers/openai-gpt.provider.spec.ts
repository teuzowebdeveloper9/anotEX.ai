import { ConfigService } from '@nestjs/config';
import { OpenAiGptProviderImpl } from './openai-gpt.provider.impl.js';

describe('OpenAiGptProviderImpl', () => {
  let provider: OpenAiGptProviderImpl;
  let configService: jest.Mocked<ConfigService>;
  let mockCreate: jest.Mock;

  beforeEach(() => {
    configService = {
      getOrThrow: jest.fn().mockReturnValue('fake-openai-key'),
    } as unknown as jest.Mocked<ConfigService>;

    mockCreate = jest.fn().mockResolvedValue({
      choices: [{ message: { content: 'Resumo gerado' } }],
    });

    provider = new OpenAiGptProviderImpl(configService);
    (provider as unknown as { openai: unknown }).openai = {
      chat: { completions: { create: mockCreate } },
    };
  });

  describe('summarize', () => {
    it('deve chamar a OpenAI com o modelo correto', async () => {
      await provider.summarize('Texto longo da aula...');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o-mini',
          temperature: 0.3,
          max_tokens: 1024,
        }),
      );
    });

    it('deve incluir o texto da transcrição no prompt', async () => {
      const text = 'Hoje vamos estudar integrais';
      await provider.summarize(text);

      const call = mockCreate.mock.calls[0][0] as { messages: Array<{ content: string }> };
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

    it('deve propagar erro da OpenAI', async () => {
      mockCreate.mockRejectedValue(new Error('API error'));

      await expect(provider.summarize('Texto')).rejects.toThrow('API error');
    });
  });

  describe('generateTitle', () => {
    it('deve chamar a OpenAI com o modelo correto e max_tokens reduzido', async () => {
      await provider.generateTitle('Texto da aula sobre derivadas');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o-mini',
          temperature: 0.3,
          max_tokens: 32,
        }),
      );
    });

    it('deve incluir o início da transcrição no prompt', async () => {
      const text = 'Hoje vamos estudar limites';
      await provider.generateTitle(text);

      const call = mockCreate.mock.calls[0][0] as { messages: Array<{ content: string }> };
      expect(call.messages[0].content).toContain(text);
    });

    it('deve retornar o título sem espaços nas extremidades', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: '  Introdução ao Cálculo  ' } }],
      });

      const result = await provider.generateTitle('Aula de cálculo');
      expect(result).toBe('Introdução ao Cálculo');
    });

    it('deve retornar string vazia se choices estiver vazio', async () => {
      mockCreate.mockResolvedValue({ choices: [] });

      const result = await provider.generateTitle('Aula');
      expect(result).toBe('');
    });

    it('deve propagar erro da OpenAI', async () => {
      mockCreate.mockRejectedValue(new Error('API error'));

      await expect(provider.generateTitle('Texto')).rejects.toThrow('API error');
    });
  });
});
