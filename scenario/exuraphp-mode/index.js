// show a check in the header: ✓ when it holds, ✗ (red) when it does not
function expect(label, ok) {
  const li = document.createElement("li");
  li.textContent = label;
  li.setAttribute(ok ? "ok" : "fail", "");
  document.querySelector("[expect]").append(li);
  if (!ok) console.error("scenario: " + label);
}


// call the API of this scenario; resolves to { status, json }
async function call(method, route, body, type = 'json') {
  const headers = {};
  let payload;
  if (body !== undefined) {
    if (type === 'form') { headers['Content-Type'] = 'application/x-www-form-urlencoded'; payload = new URLSearchParams(body).toString(); }
    else { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
  }
  const response = await fetch('/api/' + route, { method, headers, body: payload });
  const text = await response.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) {}
  show(method, route, response.status, text);
  return { status: response.status, json, headers: response.headers };
}

function show(method, route, status, text) {
  const pre = document.createElement('pre');
  pre.textContent = `${method} /api/${route} → ${status}\n${text}`;
  document.querySelector('[log]').append(pre);
}

const trace = (json) => json && Object.keys(json).find(k => k.startsWith('E X U R A - '));

(async () => {
  // development — api/
  let r = await call('GET', 'settings');
  expect('Exura::configure() exists', r.status === 200 && r.json.data !== null);
  if (r.json && r.json.data) expect('development is the default mode', r.json.data.mode === 'development');

  r = await call('GET', 'hello');
  expect('development: the answer carries the trace, with the time', r.status === 200 && !!trace(r.json) && /ms$/.test(r.json[trace(r.json)].time || ''));
  r = await call('GET', 'notice');
  expect('development: a notice stays 200 and is listed in the trace', r.status === 200 && Array.isArray(r.json[trace(r.json)].notice));
  r = await call('GET', 'boom');
  expect('development: an exception answers 500 with type, message, file and line', r.status === 500 && r.json.error.type === 'RuntimeException' && !!r.json.error.file && !!r.json.error.line);
  r = await call('GET', 'nowhere');
  expect('development: an unknown route answers 404 with the route', r.status === 404 && /nowhere$/.test(r.json.error.route || ''));

  // production — api/production/
  r = await call('GET', 'production/settings');
  expect('configure() rebases: mode production, version kept', r.status === 200 && r.json.data && r.json.data.mode === 'production' && !!r.json.data.version);
  r = await call('GET', 'production/hello');
  expect('production: no trace in the answer', r.status === 200 && r.json.data === 'hello' && !trace(r.json));
  r = await call('GET', 'production/notice');
  expect('production: a notice stays 200, without trace', r.status === 200 && !trace(r.json));
  r = await call('GET', 'production/boom');
  expect('production: an exception answers 500 with only "Internal Server Error"', r.status === 500 && JSON.stringify(r.json.error) === '{"message":"Internal Server Error"}');
  r = await call('GET', 'production/nowhere');
  expect('production: an unknown route answers 404 with only its message', r.status === 404 && JSON.stringify(r.json.error) === '{"message":"Route not found"}' && !trace(r.json));
})();
