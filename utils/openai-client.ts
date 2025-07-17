import OpenAI from 'openai';

// Singleton instance to prevent multiple OpenAI client instances
let openAIInstance: OpenAI | null = null;

export const createOpenAIClient = (): OpenAI => {
  if (!openAIInstance) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    openAIInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  return openAIInstance;
};

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export default createOpenAIClient; 