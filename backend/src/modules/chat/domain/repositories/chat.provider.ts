export interface ChatHistoryMessage {
  readonly role: 'user' | 'assistant';
  readonly content: string;
}

export interface IChatProvider {
  streamResponse(
    systemPrompt: string,
    history: ChatHistoryMessage[],
    userMessage: string,
  ): AsyncIterable<string>;
}

export const CHAT_PROVIDER = Symbol('IChatProvider');
