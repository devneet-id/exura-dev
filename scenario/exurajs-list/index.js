// show a check in the header: ✓ when it holds, ✗ (red) when it does not
function expect(label, ok) {
  const li = document.createElement("li");
  li.textContent = label;
  li.setAttribute(ok ? "ok" : "fail", "");
  document.querySelector("[expect]").append(li);
  if (!ok) console.error("scenario: " + label);
}


Exura.module(function todo() {
  const { state, effect, render } = todo;
  todo.add = (title) => title.trim() && state.set('list', [...state.get('list'), title.trim()]);
  todo.remove = (i) => state.set('list', state.get('list').filter((_, j) => j !== i));
  state.set('list', ['write a scenario', 'see it fail', 'fix it']);
  effect(() => {
    const list = state.get('list');
    state.set('summary', `${list.length} task(s)`);
    state.set('items', list.map((t, i) => `<li flex="j:between a:middle"><span>${Exura.escape(t)}</span><button button="none sm" onclick="todo.remove(${i})">✕</button></li>`).join(''));
  }, ['list']);
  effect(() => render(), ['items']);
});
todo();

const rows = () => document.querySelectorAll('[items] li').length;
expect('three tasks are listed', rows() === 3);
todo.add('<b>bold?</b>');
expect('adding one renders four', rows() === 4);
expect('a title with HTML is escaped, not rendered', !document.querySelector('[items] b'));
todo.remove(0);
expect('removing one renders three', rows() === 3);
expect('the summary follows the list', document.querySelector('exura-todo p').textContent === '3 task(s)');
