// show a check in the header: ✓ when it holds, ✗ (red) when it does not
function expect(label, ok) {
  const li = document.createElement("li");
  li.textContent = label;
  li.setAttribute(ok ? "ok" : "fail", "");
  document.querySelector("[expect]").append(li);
  if (!ok) console.error("scenario: " + label);
}


document.querySelector('[path]').textContent = location.pathname;
Exura.module(function route() {
  const { state, router, render } = route;
  state.set('matched', 'no route matched');
  router('/', () => state.set('matched', 'home'));
  router('/user/:id', ({ id }) => state.set('matched', `user ${id}`));
  router('/post/:post/comment/:comment', ({ post, comment }) => state.set('matched', `post ${post}, comment ${comment}`));
  render();
});
route();

const shown = document.querySelector('exura-route p').textContent;
const want = {
  '/': 'home',
  '/user/42': 'user 42',
  '/post/7/comment/3': 'post 7, comment 3',
}[location.pathname] ?? 'no route matched';
expect(`at ${location.pathname} the page shows "${want}"`, shown === want);
expect('a pattern matches the whole path, not a prefix', location.pathname !== '/user/42/extra' || shown === 'no route matched');
