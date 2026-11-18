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
  lazy.watch('#absent', mark('one'));   // a missing target only warns
});
lazy();

expect('nothing is seen before scrolling', seen.one === 0 && seen.two === 0);
function check() {
  document.querySelectorAll('[expect] li[late]').forEach(li => li.remove());
  const add = (label, ok) => { expect(label, ok); document.querySelector('[expect] li:last-child').setAttribute('late', ''); };
  add('box one ran exactly once', seen.one === 1);
  if (seen.two) add('box two ran exactly once', seen.two === 1);
}
