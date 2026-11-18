
// development | production
Exura.environment({
  "mode": "development"
});

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

let r = await call('GET', 'hello');
  expect('GET hello → 200 with data', r.status === 200 && r.json.data === 'hello');