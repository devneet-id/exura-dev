// exurajs — runs the playground demos in a real browser
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from '../helpers/server.mjs';
import { startBrowser, openPage } from '../helpers/browser.mjs';

let server, browser;
before(async () => {
  server = await startServer();
  browser = await startBrowser();
});
after(async () => {
  await browser.close();
  server.stop();
});

test('Exura is loaded with its version', async () => {
  const { page, errors } = await openPage(browser, server.url + '/js/state.html');
  const version = await page.evaluate(() => ExuraEnvironment.configure.get('version'));
  assert.match(version, /^\d+\.\d+\.\d+/);
  assert.deepEqual(errors, []);
});

test('module registers a global and renders state', async () => {
  const { page, errors } = await openPage(browser, server.url + '/js/state.html');
  assert.equal(await page.evaluate(() => typeof window.counter), 'function');
  assert.equal(await page.textContent('[data-count]'), '0');
  await page.click('exura-counter button[button="primary"]');
  await page.click('exura-counter button[button="primary"]');
  assert.equal(await page.textContent('[data-count]'), '2');
  await page.click('exura-counter button[button="default"]');
  assert.equal(await page.textContent('[data-count]'), '1');
  assert.deepEqual(errors, []);
});

test('effect with deps runs only for its keys; same value runs nothing', async () => {
  const { page } = await openPage(browser, server.url + '/js/state.html');
  const runs = () => page.evaluate(() => {
    const log = document.getElementById('pair-log').textContent;
    return { a: (log.match(/effect\[a\]/g) || []).length, b: (log.match(/effect\[b\]/g) || []).length };
  });
  assert.deepEqual(await runs(), { a: 1, b: 1 }); // each runs once on registration

  await page.evaluate(() => pair.state.set('a', 1));
  assert.deepEqual(await runs(), { a: 2, b: 1 });

  await page.evaluate(() => pair.state.set('b', 1));
  assert.deepEqual(await runs(), { a: 2, b: 2 });

  await page.evaluate(() => pair.state.set('a', 1)); // unchanged
  assert.deepEqual(await runs(), { a: 2, b: 2 });

  assert.equal(await page.textContent('[data-a]'), '1');
  assert.equal(await page.textContent('[data-b]'), '1');
});

test('{{key}} escapes, {{{key}}} inserts raw, attributes are escaped', async () => {
  const { page } = await openPage(browser, server.url + '/js/template.html');
  await page.evaluate(() => preview.state.set('html', '<b id="x">hi</b> & "q"'));
  assert.equal(await page.textContent('[data-escaped]'), '<b id="x">hi</b> & "q"');
  assert.equal(await page.locator('[data-escaped] b').count(), 0);
  assert.equal(await page.locator('[data-raw] b#x').count(), 1);
  assert.equal(await page.getAttribute('[data-attr]', 'title'), '<b id="x">hi</b> & "q"');
});

test('render(newBoiler) replaces the template', async () => {
  const { page } = await openPage(browser, server.url + '/js/template.html');
  assert.match(await page.textContent('exura-swap'), /Template A · exura/);
  await page.click('text=use template B');
  assert.match(await page.textContent('exura-swap'), /Template B · exura/);
});

test('store merges with state; state triggers, store needs render()', async () => {
  const { page } = await openPage(browser, server.url + '/js/store.html');
  assert.equal(await page.textContent('[data-author]'), 'exura-dev');
  assert.equal(await page.textContent('[data-views]'), '0');

  await page.evaluate(() => profile.store.set('author', 'quiet'));
  assert.equal(await page.textContent('[data-author]'), 'exura-dev', 'store alone does not re-render');

  await page.evaluate(() => profile.state.set('views', 5));
  assert.equal(await page.textContent('[data-views]'), '5');
  assert.equal(await page.textContent('[data-author]'), 'quiet', 'next render picks the store up');
});

test('watch fires once the element enters the viewport', async () => {
  const { page } = await openPage(browser, server.url + '/js/watch.html');
  assert.equal(await page.getAttribute('#box-1', 'data-seen'), null);
  await page.locator('#box-1').scrollIntoViewIfNeeded();
  await page.waitForSelector('#box-1[data-seen="true"]', { timeout: 2000 });
  assert.equal(await page.getAttribute('#box-2', 'data-seen'), null);
});

test('router passes params of the matching pattern only', async () => {
  const { page } = await openPage(browser, server.url + '/js/router.html');
  assert.equal(await page.textContent('[data-page]'), 'router.html');
  assert.match(await page.textContent('[data-user]'), /no match/);
});

test('render() of a module without an element only warns', async () => {
  const { page } = await openPage(browser, server.url + '/js/state.html');
  const warned = await page.evaluate(() => {
    const warnings = [];
    const original = console.warn;
    console.warn = (m) => warnings.push(m);
    Exura.module(function ghost() {});
    ghost.render();
    console.warn = original;
    return warnings;
  });
  assert.equal(warned.length, 1);
  assert.match(warned[0], /ghost/);
});
