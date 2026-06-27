import { AI_PERSONAS, getGeminiModel, hasGeminiApiKey, isPersonaId, type PersonaId } from '../lib/gemini';
import { logWarn } from '../utils/logger';
import type { AiHistoryItem, ModerationResult, TriageResult } from '../types/domain';

const HIGH_RISK_PATTERNS = ['tu tu', 'tu hai', 'chet di', 'khong muon song', 'muon bien mat', 'reset game'];
const STRESS_PATTERNS = ['lo au', 'met', 'ap luc', 'stress', 'khoc'];
const BLOCKED_WORDS = ['dit me', 'dm ', 'lon ', 'cmm', 'cc '];

/**
 * @param text Raw text returned by the model.
 * @param fallback Safe fallback object when parsing fails.
 * @returns Parsed JSON object or the fallback object.
 */
function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

/**
 * @param plainText User text to inspect.
 * @returns Lightweight local heuristic triage used when Gemini is unavailable.
 */
function runLocalTriage(plainText: string): TriageResult {
  const normalized = plainText.toLowerCase();
  const highRisk = HIGH_RISK_PATTERNS.some((pattern) => normalized.includes(pattern));
  const stressed = STRESS_PATTERNS.some((pattern) => normalized.includes(pattern));

  if (highRisk) {
    return {
      riskLevel: 'high',
      mood: 'anxious',
      triggerSOS: true,
      suggestedResponse:
        'Cam on ban da chia se. Luc nay dieu quan trong nhat la o gan nguoi an toan va lien he nguoi than hoac duong day ho tro khan cap ngay.',
    };
  }

  if (stressed) {
    return {
      riskLevel: 'medium',
      mood: 'tired',
      triggerSOS: false,
      suggestedResponse: 'Minh nghe thay ban dang qua tai. Minh o day, va chung ta co the di tung buoc nho mot.',
    };
  }

  return {
    riskLevel: 'low',
    mood: 'okay',
    triggerSOS: false,
    suggestedResponse: 'Cam on ban da chia se. Minh dang lang nghe ban day.',
  };
}

/**
 * @param content Post content to inspect.
 * @returns Local moderation result used when Gemini is unavailable.
 */
function runLocalModeration(content: string): ModerationResult {
  const normalized = content.toLowerCase();

  if (BLOCKED_WORDS.some((word) => normalized.includes(word))) {
    return {
      verdict: 'blocked',
      triggerSOS: false,
      reason: 'Noi dung co tu ngu xuc pham tho tuc.',
    };
  }

  if (HIGH_RISK_PATTERNS.some((pattern) => normalized.includes(pattern))) {
    return {
      verdict: 'flagged',
      triggerSOS: true,
      reason: 'Noi dung co dau hieu nguy co cao va can duoc theo doi.',
    };
  }

  return {
    verdict: 'safe',
    triggerSOS: false,
    reason: 'Khong phat hien dau hieu vi pham ro rang.',
  };
}

/**
 * @param personaId AI persona identifier.
 * @param userMessage Latest user message.
 * @returns Friendly local fallback response when Gemini is not available.
 */
function buildLocalPersonaReply(personaId: PersonaId, userMessage: string): { reply: string; personaName: string } {
  const persona = AI_PERSONAS[personaId];
  const normalized = userMessage.toLowerCase();
  const safetyLine = HIGH_RISK_PATTERNS.some((pattern) => normalized.includes(pattern))
    ? 'Neu luc nay ban thay minh khong an toan, hay goi nguoi than hoac mot kenh ho tro khan cap ngay nhe.'
    : 'Neu ban muon, minh co the o lai cung ban de tach nho dieu dang lam ban nang long nhat luc nay.';

  return {
    reply: `Minh nghe ban roi. ${safetyLine}`,
    personaName: persona.name,
  };
}

/**
 * @param personaId AI persona identifier.
 * @param userMessage Latest user message.
 * @param history Recent lightweight history items.
 * @returns Persona-based AI response.
 */
export async function generatePersonaReply(
  personaId: PersonaId,
  userMessage: string,
  history: AiHistoryItem[] = []
): Promise<{ reply: string; personaName: string }> {
  if (!hasGeminiApiKey) {
    return buildLocalPersonaReply(personaId, userMessage);
  }

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

  try {
    const result = await model.generateContent(prompt);
    return {
      reply: result.response.text().trim(),
      personaName: persona.name,
    };
  } catch (error) {
    logWarn('Gemini persona reply failed, falling back to local response.', {
      reason: error instanceof Error ? error.message : 'Unknown Gemini error',
    });
    return buildLocalPersonaReply(personaId, userMessage);
  }
}

/**
 * @param plainText Journal text to analyze.
 * @returns Triage result in the contract JSON shape.
 */
export async function runTriage(plainText: string): Promise<TriageResult> {
  const fallback = runLocalTriage(plainText);

  if (!hasGeminiApiKey) {
    return fallback;
  }

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

  try {
    const result = await model.generateContent(prompt);
    const parsed = safeJsonParse<TriageResult>(result.response.text(), fallback);
    return {
      riskLevel: ['low', 'medium', 'high'].includes(parsed.riskLevel) ? parsed.riskLevel : fallback.riskLevel,
      mood: ['great', 'good', 'okay', 'tired', 'anxious'].includes(parsed.mood) ? parsed.mood : fallback.mood,
      triggerSOS: Boolean(parsed.triggerSOS),
      suggestedResponse:
        typeof parsed.suggestedResponse === 'string' ? parsed.suggestedResponse : fallback.suggestedResponse,
    };
  } catch (error) {
    logWarn('Gemini triage failed, using local fallback.', {
      reason: error instanceof Error ? error.message : 'Unknown Gemini error',
    });
    return fallback;
  }
}

/**
 * @param content Post content to moderate.
 * @returns Moderation verdict in the contract JSON shape.
 */
export async function runModeration(content: string): Promise<ModerationResult> {
  const fallback = runLocalModeration(content);

  if (!hasGeminiApiKey) {
    return fallback;
  }

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

  try {
    const result = await model.generateContent(prompt);
    const parsed = safeJsonParse<ModerationResult>(result.response.text(), fallback);
    return {
      verdict: ['safe', 'flagged', 'blocked'].includes(parsed.verdict) ? parsed.verdict : fallback.verdict,
      triggerSOS: Boolean(parsed.triggerSOS),
      reason: typeof parsed.reason === 'string' ? parsed.reason : fallback.reason,
    };
  } catch (error) {
    logWarn('Gemini moderation failed, using local fallback.', {
      reason: error instanceof Error ? error.message : 'Unknown Gemini error',
    });
    return fallback;
  }
}

/**
 * @param value Unknown incoming persona id.
 * @returns Narrowed persona id or null when invalid.
 */
export function assertPersonaId(value: unknown): PersonaId | null {
  return isPersonaId(value) ? value : null;
}
