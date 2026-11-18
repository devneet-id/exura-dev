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

(async () => {
  let r = await call('GET', 'read?name=query&n=1');
  expect('query string → method()', r.json.data.all.name === 'query' && r.json.data.all.n === '1');
  r = await call('POST', 'read', { name: 'json', tags: ['a', 'b'] });
  expect('JSON body → method(), arrays kept', r.json.data.name === 'json' && r.json.data.all.tags.length === 2);
  r = await call('POST', 'read', { name: 'form' }, 'form');
  expect('form data → method()', r.json.data.name === 'form');
  r = await call('POST', 'read?name=query', { name: 'body' });
  expect('query and body together: the query wins', r.json.data.name === 'query');
  r = await call('GET', 'read');
  expect('a missing key → the default', r.json.data.name === 'nobody');
  r = await call('POST', 'create', { title: 'x' });
  expect('Exura::return($data, 201) → 201', r.status === 201 && r.json.state === 201);
  r = await call('GET', 'shape');
  expect('Exura::data() collects keys under data', r.json.data.first === 1 && r.json.data.second === 2);
  expect('Exura::header() sends a header', r.headers.get('x-scenario') === 'exuraphp-request');
  const trace = Object.keys(r.json).find(k => k.startsWith('E X U R A'));
  expect('every answer carries the E X U R A trace', !!trace && r.json[trace].route.endsWith('shape'));
})();
