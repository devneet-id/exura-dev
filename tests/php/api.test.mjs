// exuraphp — through the playground API (src/api/index.php)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, api } from '../helpers/server.mjs';

let server;
before(async () => { server = await startServer(); });
after(() => server.stop());

const TRACE = /^E X U R A - /;

test('GET returns data, status 200 and the trace block', async () => {
  const { status, json } = await api(server.url, 'GET', '/api/hello');
  assert.equal(status, 200);
  assert.equal(json.data, 'Hello World 👋');
  const trace = Object.keys(json).find(k => TRACE.test(k));
  assert.ok(trace, 'trace block present');
  assert.equal(json[trace].route, 'api/hello');
  assert.equal(json[trace].request, 'GET');
});

test('responses are JSON', async () => {
  const response = await fetch(server.url + '/api/hello');
  assert.match(response.headers.get('content-type'), /application\/json/);
});

test('method() reads the query string', async () => {
  const { json } = await api(server.url, 'GET', '/api/echo?name=exura&n=1');
  assert.equal(json.data.name, 'exura');
  assert.deepEqual(json.data.method, { name: 'exura', n: '1' });
});

test('method() reads a JSON body', async () => {
  const { json } = await api(server.url, 'POST', '/api/echo', { name: 'json' });
  assert.equal(json.data.request, 'POST');
  assert.equal(json.data.name, 'json');
});

test('method() reads form data', async () => {
  const response = await fetch(server.url + '/api/echo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'name=form',
  });
  assert.equal((await response.json()).data.name, 'form');
});

test('method() falls back to the default', async () => {
  const { json } = await api(server.url, 'GET', '/api/echo');
  assert.equal(json.data.name, 'nobody');
});

test('a list of methods matches each of them', async () => {
  for (const method of ['PUT', 'PATCH', 'DELETE']) {
    const { status, json } = await api(server.url, method, '/api/echo', { name: method });
    assert.equal(status, 200, method);
    assert.equal(json.data.request, method);
  }
});

test('wildcard route user/* matches user/42', async () => {
  const { status, json } = await api(server.url, 'GET', '/api/user/42');
  assert.equal(status, 200);
  assert.equal(json.data.id, '42');
});

test('a route matches whole, not by prefix', async () => {
  const { status } = await api(server.url, 'GET', '/api/hello/extra');
  assert.equal(status, 404);
});

test('?/route works without a rewritten path', async () => {
  const { status, json } = await api(server.url, 'GET', '/api/index.php?/hello');
  assert.equal(status, 200);
  assert.equal(json.data, 'Hello World 👋');
});

test('Exura::return($data, $code) sets the status', async () => {
  const { status, json } = await api(server.url, 'POST', '/api/notes', { title: 'first' });
  assert.equal(status, 201);
  assert.equal(json.data.title, 'first');
  assert.equal(json.state, 201);
});

test('validation answers 422', async () => {
  const { status, json } = await api(server.url, 'POST', '/api/notes', { title: '  ' });
  assert.equal(status, 422);
  assert.equal(json.error.message, 'title is required');
});

test('an exception becomes 500 JSON', async () => {
  const { status, json } = await api(server.url, 'GET', '/api/fail');
  assert.equal(status, 500);
  assert.equal(json.error.type, 'Exception');
  assert.equal(json.error.message, 'Something went wrong 💥');
});

test('a PHP warning becomes 500 JSON', async () => {
  const { status, json } = await api(server.url, 'GET', '/api/warn');
  assert.equal(status, 500);
  assert.match(json.error.message, /missing/);
});

test('fallback answers 404 JSON', async () => {
  const { status, json } = await api(server.url, 'GET', '/api/nowhere');
  assert.equal(status, 404);
  assert.equal(json.error.message, 'Route not found');
});

test('a known route with another method falls through to 404', async () => {
  const { status } = await api(server.url, 'DELETE', '/api/hello');
  assert.equal(status, 404);
});
