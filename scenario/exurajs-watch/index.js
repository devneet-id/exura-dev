// show a check in the header: ✓ when it holds, ✗ (red) when it does not
function expect(label, ok) {
  const li = document.createElement("li");
  li.textContent = label;
  li.setAttribute(ok ? "ok" : "fail", "");
  document.querySelector("[expect]").append(li);
  if (!ok) console.error("scenario: " + label);
}


const seen = { one: 0, two: 0 };
Exura.module(function lazy() {
  const mark = (id) => () => {
    seen[id]++;
    document.getElementById(id).textContent = `seen ${seen[id]} time(s)`;
    check();
  };
  lazy.watch('#one', mark('one'));
  lazy.watch('#two', mark('two'));
});
lazy();

expect('nothing is seen before scrolling', seen.one === 0 && seen.two === 0);

// a missing target only warns: catch the warning here instead of leaving it in the console
const warnings = [];
const warn = console.warn;
console.warn = (message) => warnings.push(String(message));
lazy.watch('#absent', () => {});
console.warn = warn;
expect('a missing target only warns: "watch target #absent not found"', warnings.length === 1 && warnings[0].includes('#absent'));
function check() {
  document.querySelectorAll('[expect] li[late]').forEach(li => li.remove());
  const add = (label, ok) => { expect(label, ok); document.querySelector('[expect] li:last-child').setAttribute('late', ''); };
  add('box one ran exactly once', seen.one === 1);
  if (seen.two) add('box two ran exactly once', seen.two === 1);
}
