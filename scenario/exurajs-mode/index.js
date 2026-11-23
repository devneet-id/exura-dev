// show a check in the header: ✓ when it holds, ✗ (red) when it does not
function expect(label, ok) {
  const li = document.createElement("li");
  li.textContent = label;
  li.setAttribute(ok ? "ok" : "fail", "");
  document.querySelector("[expect]").append(li);
  if (!ok) console.error("scenario: " + label);
}

// what exurajs writes to the console (its lines start with "EXURA" or "E X U R A")
const seen = [];
for (const type of ['log', 'debug', 'info', 'warn', 'error']) {
  const original = console[type];
  console[type] = (...args) => {
    const text = args.map(String).join(' ');
    if (/^(EXURA|E X U R A)/.test(text)) seen.push(`${type}: ${text}`);
    original.apply(console, args);
  };
}
function show(title, lines) {
  const pre = document.createElement('pre');
  pre.textContent = `${title}\n${lines.join('\n') || '(nothing)'}`;
  document.querySelector('[log]').append(pre);
}
const has = (pattern) => seen.some(line => pattern.test(line));


expect('Exura.configure() exists', typeof Exura.configure === 'function');

if (typeof Exura.configure === 'function') {

  // development — the default
  expect('development is the default mode', Exura.configure().get('mode') === 'development');

  Exura.module(function cart() {});
  expect('a banner with the version, once', seen.filter(l => /E X U R A - .* development/.test(l)).length === 1);
  expect('every module is tracked', has(/module cart\(\) ✓/));

  cart.render();
  expect('a module without its element warns on render()', has(/warn: .*cart\(\): <exura-cart> not found/));

  Exura.module(function cart() {});
  expect('a module with the same name warns that it replaces the other', has(/warn: .*module cart\(\) already exists/));

  window.ghost = 'the page\'s own';
  Exura.module(function ghost() {});
  expect('a module named like a global warns', has(/warn: .*window\.ghost already exists/));

  show('development', seen.splice(0));


  // production
  const caught = [];
  const settings = Exura.configure({ mode: 'production', onError: (error) => caught.push(String(error && error.message || error)) });
  expect('configure() rebases: mode changed, version kept', settings.get('mode') === 'production' && !!settings.get('version'));

  Exura.module(function cart() {});
  cart.render();
  Exura.module(function boom() {});
  let thrown = false;
  try { boom.effect(() => { throw new Error('an effect failed'); }); } catch (e) { thrown = true; }
  expect('an error in an effect does not escape', !thrown);

  // uncaught: a timer and a promise; a later listener sees whether exurajs cancelled them
  const cancelled = [];
  window.addEventListener('error', (e) => cancelled.push(e.defaultPrevented));
  window.addEventListener('unhandledrejection', (e) => cancelled.push(e.defaultPrevented));
  setTimeout(() => { throw new Error('a timer failed'); });
  Promise.reject(new Error('a promise failed'));

  setTimeout(() => {
    expect('production writes nothing to the console', seen.length === 0);
    expect('the timer error and the rejected promise are cancelled (never shown)', cancelled.length === 2 && cancelled.every(Boolean));
    expect('onError receives every error', ['an effect failed', 'a timer failed', 'a promise failed'].every(m => caught.includes(m)));
    show('production', seen);
    show('onError received', caught);
  }, 300);
}
