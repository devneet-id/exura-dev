// the three packages together: apps/notes (exuracss + exurajs + exuraphp)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, api } from '../helpers/server.mjs';
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

test('add, toggle and delete a note through the UI and the API', async () => {
  const { page, errors } = await openPage(browser, server.url + '/apps/notes/');
  await page.waitForSelector('[data-list] li');
  assert.match(await page.textContent('[data-list]'), /Nothing yet/);

  // add two
  for (const title of ['write tests', 'ship <exura>']) {
    await page.fill('input[name="title"]', title);
    await page.click('[data-add]');
    await page.waitForSelector(`[data-list] li[data-note]:nth-child(${title === 'write tests' ? 1 : 2})`);
  }
  assert.equal(await page.locator('[data-list] li[data-note]').count(), 2);
  assert.equal(await page.textContent('[data-summary]'), '0 / 2 done');
  // titles are escaped, not injected
  assert.equal(await page.locator('[data-list] exura').count(), 0);
  assert.match(await page.textContent('[data-list]'), /ship <exura>/);

  // the API sees the same list
  const listed = await api(server.url, 'GET', '/api/notes');
  assert.deepEqual(listed.json.data.map(n => n.title), ['write tests', 'ship <exura>']);

  // toggle the first
  await page.click('[data-list] li[data-note]:first-child input[type="checkbox"]');
  await page.waitForSelector('[data-list] li[data-done]');
  assert.equal(await page.textContent('[data-summary]'), '1 / 2 done');

  // delete the second
  await page.click('[data-list] li[data-note]:nth-child(2) button');
  await page.waitForFunction(() => document.querySelectorAll('[data-list] li[data-note]').length === 1);
  assert.equal(await page.textContent('[data-summary]'), '1 / 1 done');

  // an empty title shows the API's validation message
  await page.fill('input[name="title"]', '   ');
  await page.click('[data-add]');
  await page.waitForFunction(() => document.querySelector('[data-error]').textContent.includes('required'));

  assert.deepEqual(errors.filter(e => !/422/.test(e)), []);
});
