import { AI_PERSONAS, getGeminiModel, isPersonaId, type PersonaId } from '../lib/gemini';
import type { AiHistoryItem, ModerationResult, TriageResult } from '../types/domain';

function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

export async function generatePersonaReply(personaId: PersonaId, userMessage: string, history: AiHistoryItem[] = []) {
  const persona = AI_PERSONAS[personaId];
  const model = getGeminiModel({
    temperature: 0.75,
    maxOutputTokens: 700,
    systemInstruction: persona.systemInstruction,
  });

  const historyText = history
    .slice(-10)
    .map((item) => `${item.role === 'model' ? 'AI' : 'User'}: ${item.content}`)
    .join('\n');

  const prompt = [
    'Hay tra loi bang tieng Viet, ngan gon, am ap, khong chan doan y khoa.',
    historyText ? `Lich su gan day:\n${historyText}` : '',
    `Nguoi dung: ${userMessage}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const result = await model.generateContent(prompt);
  return {
    reply: result.response.text().trim(),
    personaName: persona.name,
  };
}

export async function runTriage(plainText: string): Promise<TriageResult> {
  const fallback: TriageResult = {
    riskLevel: 'low',
    mood: 'okay',
    triggerSOS: false,
    suggestedResponse: 'Cam on ban da chia se. Hay cho minh them mot chut thoi gian de lang nghe ban nhe.',
  };

  const model = getGeminiModel({
    temperature: 0.2,
    maxOutputTokens: 500,
    jsonMode: true,
    systemInstruction:
      'Ban la bo phan AI triage an toan cho ung dung suc khoe tinh than. Chi tra ve JSON hop le. Khong chan doan. Uu tien phat hien nguy co tu hai va goi y phan hoi an toan.',
  });

  const prompt = `Phan tich nhat ky sau va tra ve dung JSON schema:
{
  "riskLevel": "low" | "medium" | "high",
  "mood": "great" | "good" | "okay" | "tired" | "anxious",
  "triggerSOS": boolean,
  "suggestedResponse": string
}

Noi dung:
${plainText}`;

  const result = await model.generateContent(prompt);
  const parsed = safeJsonParse<TriageResult>(result.response.text(), fallback);
  return {
    riskLevel: ['low', 'medium', 'high'].includes(parsed.riskLevel) ? parsed.riskLevel : fallback.riskLevel,
    mood: ['great', 'good', 'okay', 'tired', 'anxious'].includes(parsed.mood) ? parsed.mood : fallback.mood,
    triggerSOS: Boolean(parsed.triggerSOS),
    suggestedResponse: typeof parsed.suggestedResponse === 'string' ? parsed.suggestedResponse : fallback.suggestedResponse,
  };
}

export async function runModeration(content: string): Promise<ModerationResult> {
  const localBlockedWords = ['dit me', 'dm ', 'lon ', 'cmm', 'cc '];
  const normalized = content.toLowerCase();
  if (localBlockedWords.some((word) => normalized.includes(word))) {
    return {
      verdict: 'blocked',
      triggerSOS: false,
      reason: 'Noi dung co tu ngu xuc pham tho tuc.',
    };
  }

  const fallback: ModerationResult = {
    verdict: 'safe',
    triggerSOS: false,
    reason: 'Khong phat hien dau hieu vi pham ro rang.',
  };

  const model = getGeminiModel({
    temperature: 0.15,
    maxOutputTokens: 450,
    jsonMode: true,
    systemInstruction:
      'Ban la bo loc an toan cong dong cho ung dung suc khoe tinh than. Chi tra ve JSON hop le. Danh dau flagged neu co dau hieu tu hai, bi bao hanh, kich dong, doc hai, hoac can admin xem xet.',
  });

  const prompt = `Kiem duyet bai dang sau va tra ve dung JSON schema:
{
  "verdict": "safe" | "flagged" | "blocked",
  "triggerSOS": boolean,
  "reason": string
}

Noi dung:
${content}`;

  const result = await model.generateContent(prompt);
  const parsed = safeJsonParse<ModerationResult>(result.response.text(), fallback);
  return {
    verdict: ['safe', 'flagged', 'blocked'].includes(parsed.verdict) ? parsed.verdict : fallback.verdict,
    triggerSOS: Boolean(parsed.triggerSOS),
    reason: typeof parsed.reason === 'string' ? parsed.reason : fallback.reason,
  };
}

export function assertPersonaId(value: unknown): PersonaId | null {
  return isPersonaId(value) ? value : null;
}
