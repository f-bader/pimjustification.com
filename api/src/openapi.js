export const openapi = {
  openapi: '3.1.0',
  info: { title: 'PIM Justification API', version: '1.0.0', description: 'Public randomized Entra PIM justification generator.' },
  servers: [{ url: 'https://api.pimjustification.com' }],
  paths: {
    '/v1/justification': { get: { summary: 'Return one justification', parameters: [
      { name: 'role', in: 'query', required: false, schema: { type: 'string' }, description: 'Built-in role name, alias, or template ID.' },
      { name: 'sarcasmLevel', in: 'query', required: false, schema: { type: 'integer', minimum: 0, maximum: 5, default: 0 }, description: '0 is professional; 5 is fully sarcastic.' },
    ], responses: { 200: { description: 'Justification selected.' }, 400: { description: 'Invalid role or sarcasm level.' } } } },
    '/v1/roles': { get: { summary: 'List recognized built-in Entra roles', responses: { 200: { description: 'Role catalog.' } } } },
    '/openapi.json': { get: { summary: 'Return this OpenAPI document', responses: { 200: { description: 'OpenAPI 3.1 document.' } } } },
  },
};
