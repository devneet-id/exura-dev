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

expect('Exura.environment() exists', typeof Exura.environment === 'function');
if (typeof Exura.environment === 'function') {
  Exura.environment({ mode });
}
