/*
 * exura-dev toolbar — shared by every playground page.
 * Brand (back to the exploration index), a nav per package, and a light/dark switch (remembered).
 * Only for the workbench; not part of any package.
 */
(function () {
  const KEY = 'exura-dev:dark';
  const body = document.body;

  try {
    if (localStorage.getItem(KEY) === '1') body.setAttribute('dark', '');
  } catch (e) {}

  const links = [
    ['exuracss', '/exuracss/'],
    ['exurajs', '/exurajs/'],
    ['exuraphp', '/exuraphp/'],
    ['app', '/app/'],
  ];
  const here = location.pathname;
  const section = here.split('/')[1];

  const bar = document.createElement('nav');
  bar.setAttribute('dev-bar', '');
  bar.innerHTML = `
    <a href="/" dev-brand>◆ exura-dev</a>
    <span dev-nav>${links.map(([name, href]) =>
      `<a href="${href}" ${name === section ? 'aria-current="page"' : ''}>${name}</a>`).join('')}</span>
    <button type="button" dev-dark>light / dark</button>
  `;
  body.prepend(bar);

  bar.querySelector('[dev-dark]').addEventListener('click', () => {
    body.toggleAttribute('dark');
    try {
      localStorage.setItem(KEY, body.hasAttribute('dark') ? '1' : '0');
    } catch (e) {}
  });
})();
