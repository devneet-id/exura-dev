// show a check in the header: ✓ when it holds, ✗ (red) when it does not
function expect(label, ok) {
  const li = document.createElement("li");
  li.textContent = label;
  li.setAttribute(ok ? "ok" : "fail", "");
  document.querySelector("[expect]").append(li);
  if (!ok) console.error("scenario: " + label);
}


// development | production
const mode = 'development';
document.querySelector('[mode]').textContent = mode;

expect('Exura.configure() exists', typeof Exura.configure === 'function');
if (typeof Exura.configure === 'function') {
  Exura.configure({ mode });
}
