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
  let r = await call('GET', 'mode');
  expect('Exura::environment() exists', r.status === 200 && r.json.data.environment === true);
  r = await call('GET', 'hello');
  expect('GET hello → 200 with data', r.status === 200 && r.json.data === 'hello');
})();
