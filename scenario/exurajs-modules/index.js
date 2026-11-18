// show a check in the header: ✓ when it holds, ✗ (red) when it does not
function expect(label, ok) {
  const li = document.createElement("li");
  li.textContent = label;
  li.setAttribute(ok ? "ok" : "fail", "");
  document.querySelector("[expect]").append(li);
  if (!ok) console.error("scenario: " + label);
}


Exura.module(function cart() {
  cart.state.set('count', 0);
  cart.effect(() => cart.render(), ['count']);
});
Exura.module(function shop() {
  shop.state.set('sold', 0);
  shop.effect(() => shop.render(), ['sold']);
  shop.buy = () => {
    shop.state.set('sold', shop.state.get('sold') + 1);
    cart.state.set('count', cart.state.get('count') + 1);   // one module drives another
  };
});
cart();
shop();

shop.buy(); shop.buy();
expect('each module keeps its own state', shop.state.get('sold') === 2 && cart.state.get('count') === 2);
expect('both render their own element', document.querySelector('[items]').textContent === '2' && document.querySelector('[sold]').textContent === '2');

const warnings = [];
const warn = console.warn;
console.warn = (m) => warnings.push(String(m));
Exura.module(function ghost() {});
ghost.render();
console.warn = warn;
expect('a module without <exura-ghost> only warns on render()', warnings.length === 1 && warnings[0].includes('ghost'));
expect('Exura.load() lists every module', Exura.load().has('cart') && Exura.load().has('shop') && Exura.load().has('ghost'));
