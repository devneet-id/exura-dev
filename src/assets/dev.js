/*
 * exura-dev toolbar — shared by every playground page.
 * Adds a small bar: back to the hub, light/dark switch (remembered), and the page title.
 * Only for the workbench; not part of any package.
 */
(function () {
  const KEY = 'exura-dev:dark';
  const body = document.body;

  try {
    if (localStorage.getItem(KEY) === '1') body.setAttribute('dark', '');
  } catch (e) {}

  const bar = document.createElement('div');
  bar.setAttribute('dev-bar', '');
  bar.setAttribute('flex', 'j:between a:middle');
  bar.setAttribute('size', 'px:2 py:1');
  bar.setAttribute('ring', 'b:bottom b:default-3');
  bar.innerHTML = `
    <a href="/" text="bold">◆ exura-dev</a>
    <span text="default">${document.title}</span>
    <button button="default sm" dev-dark>light / dark</button>
  `;
  body.prepend(bar);

  bar.querySelector('[dev-dark]').addEventListener('click', () => {
    body.toggleAttribute('dark');
    try {
      localStorage.setItem(KEY, body.hasAttribute('dark') ? '1' : '0');
    } catch (e) {}
  });
})();
