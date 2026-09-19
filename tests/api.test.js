import test from 'node:test';
import assert from 'node:assert/strict';
import { justifications } from '../site/justifications.js';
import { roleJustifications } from '../api/src/role-justifications.js';
import { resolveRole, roles, tailoredRoleNames } from '../api/src/roles.js';
import { createApi } from '../api/src/worker.js';

const api = createApi(() => 0);
const request = path => api.fetch(new Request(`https://api.pimjustification.com${path}`));

test('the role catalog is a complete, internally consistent reviewed snapshot', () => {
  assert.equal(roles.length, 136);
  assert.equal(new Set(roles.map(role => role.name)).size, roles.length);
  assert.equal(new Set(roles.map(role => role.templateId)).size, roles.length);
  assert.ok(roles.every(role => /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(role.templateId)));
  assert.deepEqual(resolveRole(' Global   Admin '), resolveRole('62e90394-69f5-4237-9190-012177145e10'));
  assert.equal(resolveRole('security admin').name, 'Security Administrator');
  assert.equal(resolveRole('INTUNE ADMIN').name, 'Intune Administrator');
  assert.equal(resolveRole('Directory Readers').tailored, false);
  assert.equal(resolveRole('not a role'), null);
});

test('every tailored role has six distinct 100-reason collections', () => {
  const allTailored = [];
  assert.equal(Object.keys(roleJustifications).length, tailoredRoleNames.size);
  for (const [name, levels] of Object.entries(roleJustifications)) {
    assert.ok(tailoredRoleNames.has(name));
    assert.equal(levels.length, 6);
    for (const level of levels) {
      assert.equal(level.length, 100);
      assert.equal(new Set(level).size, 100);
      for (const text of level) {
        assert.equal(text, text.trim());
        assert.ok(text.length >= 30 && text.length <= 250, text);
        assert.match(text, /[.!?]$/);
        assert.doesNotMatch(text, /[\n\r<>\[\]{}]/);
      }
    }
    allTailored.push(...levels.flat());
  }
  assert.equal(allTailored.length, 7800);
  assert.equal(new Set(allTailored).size, allTailored.length);
  assert.equal(new Set([...allTailored, ...justifications.flat()]).size, allTailored.length + justifications.flat().length);
});

test('justification API resolves aliases and template IDs to tailored content', async () => {
  const byAlias = await request('/v1/justification?role=Global%20Admin&sarcasmLevel=3');
  assert.equal(byAlias.status, 200);
  const aliasBody = await byAlias.json();
  assert.deepEqual(aliasBody.role, {
    name: 'Global Administrator', templateId: '62e90394-69f5-4237-9190-012177145e10', tailored: true,
  });
  assert.equal(aliasBody.collection, 'role');
  assert.equal(aliasBody.sarcasmLevel, 3);
  assert.equal(aliasBody.sarcasmLabel, 'Pointed');
  assert.ok(roleJustifications['Global Administrator'][3].includes(aliasBody.justification));
  assert.equal(byAlias.headers.get('cache-control'), 'no-store');
  assert.equal(byAlias.headers.get('access-control-allow-origin'), '*');

  const byId = await request('/v1/justification?role=3a2c62db-5318-420d-8d74-23affee5d9d5');
  const idBody = await byId.json();
  assert.equal(idBody.role.name, 'Intune Administrator');
  assert.ok(roleJustifications['Intune Administrator'][0].includes(idBody.justification));
});

test('generic responses work without a role and for recognized non-tailored roles', async () => {
  const noRole = await request('/v1/justification');
  const noRoleBody = await noRole.json();
  assert.equal(noRoleBody.role, null);
  assert.equal(noRoleBody.collection, 'general');
  assert.ok(justifications[0].includes(noRoleBody.justification));

  const fallback = await request('/v1/justification?role=Directory%20Readers&sarcasmLevel=5');
  const fallbackBody = await fallback.json();
  assert.equal(fallbackBody.role.tailored, false);
  assert.equal(fallbackBody.collection, 'general');
  assert.ok(justifications[5].includes(fallbackBody.justification));
});

test('API rejects invalid inputs and handles CORS and method errors', async () => {
  for (const path of [
    '/v1/justification?role=Unknown',
    '/v1/justification?role=',
    '/v1/justification?role=Global%20Admin&role=Intune%20Admin',
    '/v1/justification?sarcasmLevel=6',
    '/v1/justification?sarcasmLevel=1.5',
    '/v1/justification?sarcasmLevel=0&sarcasmLevel=1',
  ]) {
    const response = await request(path);
    assert.equal(response.status, 400, path);
    assert.match((await response.json()).error.code, /^invalid_/);
  }
  const options = await api.fetch(new Request('https://api.pimjustification.com/v1/justification', { method: 'OPTIONS' }));
  assert.equal(options.status, 204);
  assert.equal(options.headers.get('access-control-allow-methods'), 'GET, OPTIONS');
  const method = await api.fetch(new Request('https://api.pimjustification.com/v1/justification', { method: 'POST' }));
  assert.equal(method.status, 405);
  assert.equal((await method.json()).error.code, 'method_not_allowed');
  assert.equal((await request('/missing')).status, 404);
});

test('role catalog and live OpenAPI endpoint are documented and cacheable', async () => {
  const catalog = await request('/v1/roles');
  const catalogBody = await catalog.json();
  assert.equal(catalogBody.roles.length, roles.length);
  assert.equal(catalog.headers.get('cache-control'), 'public, max-age=3600');
  const globalAdmin = catalogBody.roles.find(role => role.name === 'Global Administrator');
  assert.deepEqual(globalAdmin.aliases, ['Global Admin']);
  assert.equal(globalAdmin.tailored, true);

  const schema = await request('/openapi.json');
  const schemaBody = await schema.json();
  assert.equal(schemaBody.openapi, '3.1.0');
  assert.ok(schemaBody.paths['/v1/justification']);
  assert.ok(schemaBody.paths['/v1/roles']);
});
