// show a check in the header: ✓ when it holds, ✗ (red) when it does not
function expect(label, ok) {
  const li = document.createElement("li");
  li.textContent = label;
  li.setAttribute(ok ? "ok" : "fail", "");
  document.querySelector("[expect]").append(li);
  if (!ok) console.error("scenario: " + label);
}

// send one request to api/read; body is { json }, { raw, type }, { form } or { multipart }
async function send(title, method, query = '', body = null) {
  const options = { method, headers: {} };
  if (body?.json !== undefined) { options.headers['Content-Type'] = 'application/json'; options.body = JSON.stringify(body.json); }
  if (body?.raw !== undefined) { options.headers['Content-Type'] = body.type; options.body = body.raw; }
  if (body?.form) { options.headers['Content-Type'] = 'application/x-www-form-urlencoded'; options.body = body.form; }
  if (body?.multipart) { options.body = body.multipart; }

  const response = await fetch('/api/read' + query, options);
  const text = await response.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) {}

  const pre = document.createElement('pre');
  pre.textContent = `${title}\n${method} /api/read${query} → ${response.status}\n` +
    (json ? JSON.stringify(json.data ?? json.error ?? json, null, 2) : (text || '(empty body)'));
  document.querySelector('[log]').append(pre);

  const read = json?.data?.read ?? {};
  const value = (key) => read[key]?.value;
  const type = (key) => read[key]?.type;
  return { status: response.status, json, read, value, type, files: json?.data?.files ?? [] };
}

(async () => {
  // 1 · JSON keeps its types
  let r = await send('JSON body, every type', 'POST', '', { json: {
    text: 'text', int: 42, float: 1.5, yes: true, no: false, empty: '', zero: 0,
    list: [1, 2], object: { x: 1 }, nothing: null,
  } });
  expect('JSON: a string stays a string', r.value('text') === 'text' && r.type('text') === 'string');
  expect('JSON: 42 is an int, 1.5 a float', r.type('int') === 'int' && r.type('float') === 'float');
  expect('JSON: true and false stay booleans (false is not taken for missing)', r.value('yes') === true && r.value('no') === false);
  expect('JSON: "" and 0 come back as they are', r.value('empty') === '' && r.value('zero') === 0);
  expect('JSON: lists and objects become arrays', Array.isArray(r.value('list')) && r.value('object')?.x === 1);
  expect('JSON: a missing key gives the default', r.value('missing') === '«default»');
  expect('JSON: null comes back as null — not as the default', r.value('nothing') === null);
  // sent as raw text: a JavaScript number would already lose the digits
  r = await send('JSON body with a big integer', 'POST', '', { raw: '{"big": 12345678901234567890}', type: 'application/json' });
  expect('JSON: a big integer (12345678901234567890) keeps every digit', String(r.value('big')) === '12345678901234567890');

  // 2 · the query string: always strings
  r = await send('query string', 'GET', '?text=hi&int=42&no=false&empty=&list[]=1&list[]=2&a.b=dot&twice=1&twice=2');
  expect('query: every value is a string ("42", "false")', r.value('int') === '42' && r.value('no') === 'false');
  expect('query: list[]=1&list[]=2 is an array', Array.isArray(r.value('list')) && r.value('list').length === 2);
  expect('query: an empty value is ""', r.value('empty') === '');
  expect('query: the same key twice → the last one', r.value('twice') === '2');
  expect('query: a.b arrives as a_b (PHP renames dots and spaces)', r.value('a_b') === 'dot' && r.value('a.b') === undefined);

  // 3 · forms
  r = await send('form, POST', 'POST', '', { form: 'text=hi&int=42&map[k]=v' });
  expect('form POST: fields read, nested map[k] is an array', r.value('text') === 'hi' && r.value('map')?.k === 'v');
  r = await send('form, PUT', 'PUT', '', { form: 'text=hi&int=42' });
  expect('form PUT: fields read from the body', r.value('text') === 'hi' && r.value('int') === '42');

  // 4 · multipart (file uploads)
  let fd = new FormData();
  fd.append('text', 'hi');
  fd.append('upload', new Blob(['hello'], { type: 'text/plain' }), 'hello.txt');
  r = await send('multipart, POST, with a file', 'POST', '', { multipart: fd });
  expect('multipart POST: fields read', r.value('text') === 'hi');
  expect('multipart POST: a file is not in method() — read it from $_FILES', r.value('upload') === undefined && r.files.includes('upload'));
  fd = new FormData();
  fd.append('text', 'hi');
  r = await send('multipart, PUT', 'PUT', '', { multipart: fd });
  expect('multipart PUT: fields read (PHP only parses multipart for POST)', r.value('text') === 'hi');

  // 5 · several sources at once
  r = await send('JSON body and query with the same key', 'POST', '?text=from-query', { json: { text: 'from-body', only: 'body' } });
  expect('body and query merge; on the same key the query wins', r.value('text') === 'from-query' && r.value('only') === 'body');

  // 6 · bodies that are not an object
  r = await send('JSON body that is a number', 'POST', '', { raw: '42', type: 'application/json' });
  expect('a JSON body that is not an object (42) still answers JSON', r.json !== null);
  r = await send('JSON body that is a number, plus a query string', 'POST', '?text=hi', { raw: '42', type: 'application/json' });
  expect('…and with a query string too (42 + ?text=hi)', r.json !== null);
  r = await send('broken JSON with a JSON content type', 'POST', '', { raw: '{"text": "broken"', type: 'application/json' });
  expect('broken JSON is refused (4xx), not read as a form', r.status >= 400 && r.status < 500);
  expect('broken JSON leaves no strange keys behind', Object.keys(r.read).every(key => key === 'missing'));
})();
