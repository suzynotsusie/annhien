import Groq from 'groq-sdk';
import type { AiHistoryItem } from '../types/domain';

const groqApiKey = process.env.GROQ_API_KEY || '';
export const hasGroqApiKey = Boolean(groqApiKey);

if (!hasGroqApiKey) {
  console.warn('Thieu GROQ_API_KEY trong .env. Fallback Groq se bi bo qua.');
}

export const groq = new Groq({ apiKey: groqApiKey });

export interface GroqCompletionOptions {
  systemInstruction?: string;
  userPrompt: string;
  history?: AiHistoryItem[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export async function generateGroqCompletion(options: GroqCompletionOptions): Promise<string> {
  const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [];

  if (options.systemInstruction) {
    messages.push({ role: 'system', content: options.systemInstruction });
  }

  if (options.history && options.history.length > 0) {
    for (const item of options.history.slice(-10)) {
      messages.push({
        role: item.role === 'model' ? 'assistant' : 'user',
        content: item.content,
      });
    }
  }

  messages.push({ role: 'user', content: options.userPrompt });

  const completion = await groq.chat.completions.create({
    messages,
    model: 'llama-3.1-8b-instant',
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 700,
    response_format: options.jsonMode ? { type: 'json_object' } : { type: 'text' },
  });

  return completion.choices[0]?.message?.content || '';
}
