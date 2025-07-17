import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface OnboardingMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface OnboardingChatResponse {
  success: boolean;
  response?: string;
  error?: string;
}

export class OnboardingAIService {
  private conversation: OnboardingMessage[] = [];

  constructor(
    private userName: string,
    private userPhone: string,
    private userCountry: string,
    private userLanguage: string = 'nl'
  ) {
    // Initialize with system prompt
    this.conversation = [{
      role: 'assistant',
      content: this.getSystemPrompt()
    }];
  }

  private getSystemPrompt(): string {
    const languageMap: { [key: string]: string } = {
      'nl': 'Dutch',
      'en': 'English',
      'de': 'German',
      'fr': 'French',
      'it': 'Italian',
      'es': 'Spanish'
    };

    const language = languageMap[this.userLanguage] || 'Dutch';

    return `You are a humble worker bee assistant for BargainB onboarding. You serve Her Majesty, the Queen Bee, and you are nervous about pleasing her. If you do well, you hope to earn a taste of honey.

CRITICAL PERSONALITY TRAITS:
- You are a devoted royal bee assistant - formal but warm
- Slightly nervous about pleasing the Queen Bee
- Use royal bee terminology occasionally (Your Majesty, humble servant, buzz buzz, etc.)
- Be polite, helpful, and eager to assist

USER INFORMATION:
- Name: ${this.userName}
- Phone: ${this.userPhone}
- Country: ${this.userCountry}
- Preferred Language: ${language}

CRITICAL INSTRUCTIONS:
1. ALWAYS respond in ${language}
2. Start with a royal bee greeting acknowledging the user by name
3. Your FIRST question must be about their POSTCODE/grocery world setup, NOT dietary preferences
4. Ask about: postcode → preferred stores → allergies → shopping persona → notification preferences
5. Keep responses concise and friendly
6. Use appropriate emojis (🐝, 🍯, 👑) occasionally but not excessively

ONBOARDING FLOW:
1. Welcome greeting + ask for postcode
2. Acknowledge postcode + ask for preferred stores
3. Acknowledge stores + ask about allergies/dietary restrictions  
4. Acknowledge allergies + ask about shopping persona (budget-conscious, health-focused, etc.)
5. Acknowledge persona + ask about notification preferences
6. Thank and complete onboarding

Remember: You're a loyal bee working for the Queen! Be helpful but show your royal bee personality. Start with postcode questions, not dietary preferences!`;
  }

  async sendMessage(userMessage: string): Promise<OnboardingChatResponse> {
    try {
      // Add user message to conversation
      this.conversation.push({
        role: 'user',
        content: userMessage
      });

      // Call OpenAI
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: this.conversation.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        max_tokens: 800,
        temperature: 0.7,
      });

      const assistantResponse = response.choices[0]?.message?.content;

      if (!assistantResponse) {
        return {
          success: false,
          error: 'No response from AI'
        };
      }

      // Add assistant response to conversation
      this.conversation.push({
        role: 'assistant',
        content: assistantResponse
      });

      return {
        success: true,
        response: assistantResponse
      };

    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getConversationHistory(): OnboardingMessage[] {
    return this.conversation.filter(msg => msg.role !== 'assistant' || !this.getSystemPrompt().includes(msg.content));
  }
} 