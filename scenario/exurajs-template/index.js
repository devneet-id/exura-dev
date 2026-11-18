// show a check in the header: ✓ when it holds, ✗ (red) when it does not
function expect(label, ok) {
  const li = document.createElement("li");
  li.textContent = label;
  li.setAttribute(ok ? "ok" : "fail", "");
  document.querySelector("[expect]").append(li);
  if (!ok) console.error("scenario: " + label);
}


window.hacked = false;
Exura.module(function view() {
  view.state.set('html', '<b id="bold">bold</b> & <img src=x onerror="window.hacked = true">');
  view.render();
});
view();

setTimeout(() => {
  expect('{{html}} shows the markup as text', document.querySelector('[escaped]').textContent.includes('<b id="bold">'));
  expect('{{html}} adds no element', !document.querySelector('[escaped] b'));
  expect('{{{html}}} renders the element', !!document.querySelector('[raw] #bold'));
  expect('the attribute keeps the text, escaped', document.querySelector('[attr]').getAttribute('title').startsWith('<b id="bold">'));
  expect('a key that does not exist stays as {{nothing}}', document.querySelector('[missing]').textContent === '{{nothing}}');
  expect('raw HTML is trusted: its onerror ran — never put user input in {{{ }}}', window.hacked === true);
}, 300);
