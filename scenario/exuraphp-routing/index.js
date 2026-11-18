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
  let r = await call('GET', 'hello');
  expect('GET hello → 200 with data', r.status === 200 && r.json.data === 'hello');
  r = await call('POST', 'hello');
  expect('POST hello (route is GET only) → 404', r.status === 404);
  for (const m of ['PUT', 'PATCH']) {
    r = await call(m, 'item');
    expect(`${m} item (['PUT','PATCH']) → 200`, r.status === 200 && r.json.data === m);
  }
  r = await call('GET', 'user/42');
  expect('GET user/42 (user/*) → 42', r.status === 200 && r.json.data === '42');
  r = await call('GET', 'user/42/posts');
  expect('GET user/42/posts also matches user/* (the * takes the rest)', r.status === 200);
  r = await call('GET', 'hello/extra');
  expect('GET hello/extra does not match hello → 404', r.status === 404);
  r = await call('GET', 'index.php?/hello');
  expect('index.php?/hello works without a rewritten path', r.status === 200 && r.json.data === 'hello');
  r = await call('GET', 'nowhere');
  expect('an unknown route → 404 JSON', r.status === 404 && r.json.error.message === 'Route not found');
})();
