const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');

const backendRoot = path.resolve(__dirname, '..');

async function getFreePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}

async function waitForHealth(baseUrl, child) {
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < 10000) {
    if (child.exitCode !== null) {
      throw new Error(`Server exited early with code ${child.exitCode}`);
    }

    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw lastError || new Error('Server did not become healthy in time');
}

async function requestJson(baseUrl, pathName, options = {}) {
  const response = await fetch(`${baseUrl}${pathName}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

test('API smoke and negative contract checks', async (t) => {
  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const child = spawn('node', ['dist/index.js'], {
    cwd: backendRoot,
    env: {
      ...process.env,
      PORT: String(port),
      FRONTEND_URL: 'http://localhost:3000',
      SUPABASE_URL: 'not-a-real-url',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
      GEMINI_API_KEY: '',
      JWT_SECRET: 'api-smoke-secret',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let logs = '';
  child.stdout.on('data', (chunk) => {
    logs += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    logs += chunk.toString();
  });

  t.after(() => {
    if (child.exitCode === null) {
      child.kill();
    }
  });

  await waitForHealth(baseUrl, child);

  await t.test('GET /api/health returns ok', async () => {
    const { response, body } = await requestJson(baseUrl, '/api/health');
    assert.equal(response.status, 200);
    assert.equal(body.status, 'ok');
    assert.equal(body.message, 'An Nhien API Server dang hoat dong');
  });

  await t.test('unknown endpoint returns 404 with JSON error code', async () => {
    const { response, body } = await requestJson(baseUrl, '/api/khong-ton-tai');
    assert.equal(response.status, 404);
    assert.equal(body.code, 'NOT_FOUND');
  });

  await t.test('protected auth route rejects missing token', async () => {
    const { response, body } = await requestJson(baseUrl, '/api/auth/me');
    assert.equal(response.status, 401);
    assert.equal(body.code, 'UNAUTHORIZED');
  });

  await t.test('auth setup validates nickname before database access', async () => {
    const { response, body } = await requestJson(baseUrl, '/api/auth/setup', {
      method: 'POST',
      body: JSON.stringify({ nickname: '', topics: [], role: 'user' }),
    });
    assert.equal(response.status, 400);
    assert.equal(body.code, 'INVALID_NICKNAME');
  });

  await t.test('posts topic filter rejects unsupported topic before database access', async () => {
    const { response, body } = await requestJson(baseUrl, '/api/posts?topic=bad-topic');
    assert.equal(response.status, 400);
    assert.equal(body.code, 'INVALID_TOPIC');
  });

  await t.test('message route rejects missing token before body/database work', async () => {
    const { response, body } = await requestJson(baseUrl, '/api/messages', {
      method: 'POST',
      body: JSON.stringify({ conversationId: 'conv-1', content: 'hello' }),
    });
    assert.equal(response.status, 401);
    assert.equal(body.code, 'UNAUTHORIZED');
  });

  assert.match(logs, /An Nhien Backend dang chay/);
});
