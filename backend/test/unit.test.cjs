const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const constants = require('../dist/lib/constants.js');
const validation = require('../dist/lib/validation.js');
const mappers = require('../dist/lib/mappers.js');
const { verifyToken, requireRole } = require('../dist/middleware/auth.js');

function createResponseRecorder() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test('validation helpers accept only supported enum values', () => {
  assert.equal(validation.asUserRole('user'), 'user');
  assert.equal(validation.asUserRole('healer'), 'healer');
  assert.equal(validation.asUserRole('bad-role'), null);
  assert.equal(validation.asTopic('daily'), 'daily');
  assert.equal(validation.asTopic('unknown'), null);
  assert.equal(validation.asMood('anxious'), 'anxious');
  assert.equal(validation.asMood('sad'), null);
  assert.equal(validation.asReaction('hug'), 'hug');
  assert.equal(validation.asReaction('like'), null);
  assert.equal(validation.asPostStatus('hidden'), 'hidden');
  assert.equal(validation.asPostStatus('deleted'), null);
});

test('sanitizeTopics returns only string topics and caps length', () => {
  const result = validation.sanitizeTopics(['study', 123, 'daily', null, 'family']);
  assert.deepEqual(result, ['study', 'daily', 'family']);
  assert.equal(validation.sanitizeTopics('study'), null);
  assert.equal(validation.sanitizeTopics(Array.from({ length: 20 }, (_, index) => `topic-${index}`)).length, 10);
});

test('mappers convert database snake_case rows into API camelCase objects', () => {
  assert.deepEqual(
    mappers.mapUser({
      id: 'user-1',
      nickname: 'Duong',
      role: 'user',
      topics: ['study'],
      created_at: '2026-06-27T00:00:00.000Z',
    }),
    {
      id: 'user-1',
      nickname: 'Duong',
      role: 'user',
      topics: ['study'],
      createdAt: '2026-06-27T00:00:00.000Z',
    }
  );

  assert.deepEqual(
    mappers.mapMessage({
      id: 'msg-1',
      conversation_id: 'conv-1',
      sender_id: null,
      sender_role: 'ai',
      content: 'Xin chao',
      created_at: '2026-06-27T00:00:01.000Z',
    }),
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: null,
      senderRole: 'ai',
      content: 'Xin chao',
      createdAt: '2026-06-27T00:00:01.000Z',
    }
  );
});

test('constants keep API contract defaults stable', () => {
  assert.equal(constants.JWT_EXPIRES_IN_SECONDS, 31536000);
  assert.deepEqual(constants.DEFAULT_REACTIONS, {
    hug: 0,
    empathy: 0,
    peace: 0,
  });
});

test('verifyToken attaches decoded user to request', () => {
  process.env.JWT_SECRET = 'unit-test-secret';
  const token = jwt.sign({ userId: 'user-1', role: 'user', nickname: 'Duong' }, process.env.JWT_SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createResponseRecorder();
  let nextCalled = false;

  verifyToken(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.deepEqual(req.user, {
    userId: 'user-1',
    role: 'user',
    nickname: 'Duong',
  });
});

test('verifyToken rejects missing token with contract error shape', () => {
  const req = { headers: {} };
  const res = createResponseRecorder();
  let nextCalled = false;

  verifyToken(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, {
    message: 'Chua dang nhap',
    code: 'UNAUTHORIZED',
  });
});

test('requireRole blocks users outside the allowed role list', () => {
  const req = { user: { userId: 'user-1', role: 'user', nickname: 'Duong' } };
  const res = createResponseRecorder();
  let nextCalled = false;

  requireRole('admin')(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.code, 'FORBIDDEN');
});
