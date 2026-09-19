import { justifications } from '../../site/justifications.js';
import { openapi } from './openapi.js';
import { roleJustifications } from './role-justifications.js';
import { resolveRole, roles } from './roles.js';

const labels = ['Off', 'Subtle', 'Dry', 'Pointed', 'Heavy', 'Fully sarcastic'];
const baseHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': 'Content-Type',
  'x-content-type-options': 'nosniff',
};

function json(value, { status = 200, cacheControl = 'no-store' } = {}) {
  return new Response(JSON.stringify(value), { status, headers: {
    ...baseHeaders,
    'content-type': 'application/json; charset=utf-8',
    'cache-control': cacheControl,
  } });
}

function error(status, code, message) {
  return json({ error: { code, message } }, { status });
}

function oneParam(params, name) {
  const values = params.getAll(name);
  return values.length <= 1 ? values[0] ?? null : undefined;
}

function parseLevel(value) {
  if (value === null) return 0;
  return /^[0-5]$/.test(value) ? Number(value) : null;
}

export function createApi(random = Math.random) {
  return {
    fetch(request) {
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: baseHeaders });
      if (request.method !== 'GET') return error(405, 'method_not_allowed', 'Only GET is supported.');

      const url = new URL(request.url);
      if (url.pathname === '/openapi.json') return json(openapi, { cacheControl: 'public, max-age=3600' });
      if (url.pathname === '/v1/roles') return json({ roles }, { cacheControl: 'public, max-age=3600' });
      if (url.pathname !== '/v1/justification') return error(404, 'not_found', 'The requested endpoint does not exist.');

      const roleValue = oneParam(url.searchParams, 'role');
      const levelValue = oneParam(url.searchParams, 'sarcasmLevel');
      if (roleValue === undefined || levelValue === undefined || roleValue === '') {
        return error(400, 'invalid_request', 'Each query parameter may appear once; role cannot be blank.');
      }
      const level = parseLevel(levelValue);
      if (level === null) return error(400, 'invalid_sarcasm_level', 'sarcasmLevel must be an integer from 0 through 5.');

      const role = roleValue === null ? null : resolveRole(roleValue);
      if (roleValue !== null && !role) {
        return error(400, 'invalid_role', 'role must be a recognized built-in Entra role name, alias, or template ID.');
      }
      const collection = role?.tailored ? roleJustifications[role.name][level] : justifications[level];
      const justification = collection[Math.floor(random() * collection.length)];
      return json({
        justification,
        sarcasmLevel: level,
        sarcasmLabel: labels[level],
        role: role && { name: role.name, templateId: role.templateId, tailored: role.tailored },
        collection: role?.tailored ? 'role' : 'general',
      });
    },
  };
}

export default createApi();
