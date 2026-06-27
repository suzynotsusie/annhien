const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const backendRoot = path.resolve(__dirname, '..');
const srcRoot = path.join(backendRoot, 'src');

function readAllSourceFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...readAllSourceFiles(fullPath));
    } else if (entry.isFile() && fullPath.endsWith('.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

test('backend mounts all API route groups required by api-contract.md', () => {
  const indexSource = fs.readFileSync(path.join(srcRoot, 'index.ts'), 'utf8');
  const mountedRoutes = [
    '/api/auth',
    '/api/journals',
    '/api/posts',
    '/api/conversations',
    '/api/messages',
    '/api/videos',
    '/api/ai',
  ];

  for (const route of mountedRoutes) {
    assert.match(indexSource, new RegExp(`app\\.use\\('${route}'`));
  }
});

test('step 2.1 enterprise folders exist in backend/src', () => {
  const requiredDirs = ['controllers', 'services', 'middlewares', 'routes', 'validations', 'utils'];

  for (const dir of requiredDirs) {
    const fullPath = path.join(srcRoot, dir);
    assert.ok(fs.existsSync(fullPath), `${dir} directory is missing`);
    assert.ok(fs.statSync(fullPath).isDirectory(), `${dir} is not a directory`);
  }
});

test('chat backend remains text-only and has no upload/media handlers', () => {
  const forbiddenPatterns = [
    /\bupload\b/i,
    /\bimage_url\b/i,
    /\bmedia_url\b/i,
    /\bmulter\b/i,
    /\bmultipart\b/i,
    /\bform-data\b/i,
  ];

  for (const file of readAllSourceFiles(srcRoot)) {
    const source = fs.readFileSync(file, 'utf8');
    for (const pattern of forbiddenPatterns) {
      assert.doesNotMatch(source, pattern, `${path.relative(backendRoot, file)} matched ${pattern}`);
    }
  }
});

test('package exposes repeatable test scripts', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(backendRoot, 'package.json'), 'utf8'));
  assert.equal(pkg.scripts.build, 'tsc');
  assert.ok(pkg.scripts.test.includes('node --test'));
  assert.ok(pkg.scripts['test:unit']);
  assert.ok(pkg.scripts['test:api']);
  assert.ok(pkg.scripts['test:contract']);
  assert.ok(pkg.dependencies.zod);
  assert.ok(pkg.dependencies['crypto-js']);
  assert.ok(pkg.dependencies.bcryptjs);
  assert.ok(pkg.dependencies['express-async-errors']);
});
