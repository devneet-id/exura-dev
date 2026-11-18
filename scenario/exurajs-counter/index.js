// show a check in the header: ✓ when it holds, ✗ (red) when it does not
function expect(label, ok) {
  const li = document.createElement("li");
  li.textContent = label;
  li.setAttribute(ok ? "ok" : "fail", "");
  document.querySelector("[expect]").append(li);
  if (!ok) console.error("scenario: " + label);
}


Exura.module(function counter() {
  const { state, effect, render } = counter;
  state.set('count', 0);
  effect(() => render(), ['count']);
});
counter();

const count = () => document.querySelector('[count]').textContent.trim();
expect('the module is a global function: window.counter', typeof window.counter === 'function');
expect('it renders the first state: 0', count() === '0');
document.querySelector('[plus]').click();
document.querySelector('[plus]').click();
expect('two clicks on + render 2', count() === '2');
document.querySelector('[minus]').click();
expect('one click on − renders 1', count() === '1');
let runs = 0;
counter.effect(() => runs++, ['count']);
counter.state.set('count', 1);
expect('setting the same value runs no effect', runs === 1);
counter.state.set('count', 0);
expect('a new value runs it again', runs === 2 && count() === '0');
