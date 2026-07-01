const dotenv = require('dotenv');
dotenv.config();

const { runTriage } = require('./src/services/ai.service');

async function test() {
  const text = 'tôi cảm thấy tệ quá cuộc đời này chỉ toàn niềm đau';
  console.log('Testing text:', text);
  try {
    const result = await runTriage(text);
    console.log('Triage result:', result);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
