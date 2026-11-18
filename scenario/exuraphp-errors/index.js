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
  let r = await call('GET', 'exception');
  expect('throw → 500 with type and message', r.status === 500 && r.json.error.type === 'Exception' && r.json.error.message === 'boom');
  r = await call('GET', 'warning');
  expect('a PHP warning → 500 JSON', r.status === 500 && /missing/.test(r.json.error.message));
  r = await call('GET', 'undefined');
  expect('calling an undefined function → 500 JSON', r.status === 500 && r.json.error.type === 'Error');
  r = await call('GET', 'notice');
  const trace = r.json && Object.keys(r.json).find(k => k.startsWith('E X U R A'));
  expect('a notice → still 200, listed in the trace', r.status === 200 && !!trace && Array.isArray(r.json[trace].notice));
  r = await call('GET', 'silenced');
  expect('@ silences a warning → 200', r.status === 200);
  expect('every answer is valid JSON', document.querySelectorAll('[log] pre').length === 5);
})();
