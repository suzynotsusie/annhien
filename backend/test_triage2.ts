const dotenv = require('dotenv');
dotenv.config();

const { generateGroqCompletion } = require('./src/lib/groq');

async function test() {
  const prompt = `Phan tich nhat ky sau va tra ve dung JSON schema:
{
  "riskLevel": "low" | "medium" | "high",
  "mood": "great" | "good" | "okay" | "tired" | "anxious",
  "triggerSOS": boolean,
  "suggestedResponse": string
}

Noi dung:
tôi cảm thấy tệ quá cuộc đời này chỉ toàn niềm đau`;

  try {
    const reply = await generateGroqCompletion({
      systemInstruction: 'Ban la bo phan AI triage an toan cho ung dung suc khoe tinh than. Chi tra ve JSON hop le. Khong chan doan. Uu tien phat hien nguy co tu hai va goi y phan hoi an toan.',
      userPrompt: prompt,
      temperature: 0.2,
      maxTokens: 500,
      jsonMode: true,
    });
    console.log('Groq reply:', reply);
  } catch (err) {
    console.error('Groq error:', err);
  }
}

test();
