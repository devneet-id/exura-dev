// exuracss — computed styles on the playground pages
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from '../helpers/server.mjs';
import { startBrowser, openPage as open, stillScript } from '../helpers/browser.mjs';

const openPage = (browser, url) => open(browser, url, { still: true });

let server, browser;
before(async () => {
  server = await startServer();
  browser = await startBrowser();
});
after(async () => {
  await browser.close();
  server.stop();
});

const style = (page, selector, prop, pseudo = null) =>
  page.$eval(selector, (el, [prop, pseudo]) => getComputedStyle(el, pseudo)[prop], [prop, pseudo]);

const alpha = (color) => {
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return 1;
  const parts = m[1].split(/[ ,/]+/).filter(Boolean);
  return parts.length === 4 ? Number(parts[3]) : 1;
};

test('every playground page loads without errors or missing files', async () => {
  const pages = [
    '/', '/css/components.html', '/css/layout.html', '/css/text.html', '/css/color.html', '/css/clip.html',
    '/js/state.html', '/js/template.html', '/js/store.html', '/js/watch.html', '/js/router.html', '/js/api.html',
    '/apps/notes/',
  ];
  for (const path of pages) {
    const page = await browser.newPage();
    const problems = [];
    page.on('pageerror', e => problems.push(e.message));
    page.on('console', m => { if (m.type() === 'error') problems.push(m.text()); });
    page.on('response', r => { if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`); });
    await page.goto(server.url + path, { waitUntil: 'networkidle' });
    assert.deepEqual(problems, [], path);
    await page.close();
  }
});

test('button variants get their own colors', async () => {
  const { page } = await openPage(browser, server.url + '/css/components.html');
  const primary = await style(page, 'button[button="primary"]', 'backgroundColor');
  const secondary = await style(page, 'button[button="secondary"]', 'backgroundColor');
  assert.notEqual(alpha(primary), 0, 'primary is filled');
  assert.notEqual(primary, secondary);
});

test('card shade N is a tint with alpha N/10', async () => {
  const { page } = await openPage(browser, server.url + '/css/color.html');
  for (const n of [1, 5, 10]) {
    const bg = await style(page, `[card="primary:${n}"]`, 'backgroundColor');
    assert.ok(Math.abs(alpha(bg) - n / 10) < 0.01, `primary:${n} → ${bg}`);
  }
});

test('the palette page finds every color of exura.json', async () => {
  const { page } = await openPage(browser, server.url + '/css/color.html');
  const sections = await page.locator('#palette section').count();
  assert.ok(sections >= 7, `found ${sections} colors`);
});

test('dark on <body> changes the page colors', async () => {
  const { page } = await openPage(browser, server.url + '/css/components.html');
  await page.evaluate(() => document.body.removeAttribute('dark'));
  const light = await style(page, 'body', 'backgroundColor');
  await page.evaluate(() => document.body.setAttribute('dark', ''));
  const dark = await style(page, 'body', 'backgroundColor');
  assert.notEqual(light, dark);
});

test('flex grammar maps to flexbox', async () => {
  const { page } = await openPage(browser, server.url + '/css/layout.html');
  assert.equal(await style(page, '[flex="j:between a:middle"]', 'display'), 'flex');
  assert.equal(await style(page, '[flex="j:between a:middle"]', 'justifyContent'), 'space-between');
  assert.equal(await style(page, '[flex="j:between a:middle"]', 'alignItems'), 'center');
  assert.equal(await style(page, '[flex="d:column"]', 'flexDirection'), 'column');
});

test('size w:1/2 is half of its row', async () => {
  const { page } = await openPage(browser, server.url + '/css/layout.html');
  const ratio = await page.$eval('#size [size="w:1/2 p:1"]', el => el.getBoundingClientRect().width / el.parentElement.getBoundingClientRect().width);
  assert.ok(Math.abs(ratio - 0.5) < 0.01, `ratio ${ratio}`);
});

test('responsive prefix md:size applies from the md breakpoint', async () => {
  const page = await browser.newPage({ viewport: { width: 375, height: 800 } });
  await page.addInitScript(stillScript);
  await page.goto(server.url + '/css/layout.html');
  const ratio = () => page.$eval('[lg\\:size="w:1/4"]', el => el.getBoundingClientRect().width / el.parentElement.getBoundingClientRect().width);
  assert.ok(Math.abs(await ratio() - 1) < 0.01, 'full on phones');
  await page.setViewportSize({ width: 900, height: 800 });
  assert.ok(Math.abs(await ratio() - 0.5) < 0.01, 'half from md');
  await page.setViewportSize({ width: 1200, height: 800 });
  assert.ok(Math.abs(await ratio() - 0.25) < 0.01, 'quarter from lg');
  await page.close();
});

test('text sizes follow h1 > h3 > h6', async () => {
  const { page } = await openPage(browser, server.url + '/css/text.html');
  const px = async (s) => parseFloat(await style(page, s, 'fontSize'));
  const [h1, h3, h6] = [await px('[text="h1"]'), await px('[text="h3"]'), await px('[text="h6"]')];
  assert.ok(h1 > h3 && h3 > h6, `${h1} > ${h3} > ${h6}`);
  assert.equal(await style(page, '[text="center"]', 'textAlign'), 'center');
});

test('clip e:NAME draws an emoji; a: and ef: exist', async () => {
  const { page } = await openPage(browser, server.url + '/css/clip.html');
  const content = await style(page, '#emoji [clip="e:rocket"]', 'content', '::before');
  assert.notEqual(content, 'none');
  assert.ok(content.length > 2, `content ${content}`);
  assert.ok(await page.locator('#animations > div').count() > 0, 'animations listed');
  assert.ok(await page.locator('#effects > div').count() > 0, 'effects listed');
  assert.match(await page.textContent('#count'), /\(\d{2,}/);
});

// WCAG contrast of the text of a tinted card against what is really behind it (tint over the page)
const contrastOfCard = (page, selector) => page.$eval(selector, (el) => {
  const rgba = (c) => (c.match(/[\d.]+/g) || []).map(Number).concat([1]).slice(0, 4);
  const [r, g, b, a] = rgba(getComputedStyle(el).backgroundColor);
  const [pr, pg, pb] = rgba(getComputedStyle(document.body).backgroundColor);
  const bg = [r * a + pr * (1 - a), g * a + pg * (1 - a), b * a + pb * (1 - a)];
  const fg = rgba(getComputedStyle(el).color);
  const lum = ([r, g, b]) => [r, g, b].map(v => v / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  const [l1, l2] = [lum(fg), lum(bg)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
});

// Color balancing: every tint (card="NAME:N") of every color keeps readable text, on a light and a dark page.
// 4.0 is the best two palette inks (dark #171719, light #f5f5f5) can reach on a mid-tone tint.
// Known issue in exuracss 1.1.0: tints always used one fixed ink (contrast down to 1.0).
// Fixed in exuracss after 1.1.0 (ink per tint, per mode) — drop `todo` once php exura fetches a release with it.
test('every tint keeps readable text in light and dark', { todo: 'exuracss 1.1.0: fixed tint ink; fixed in the next release' }, async () => {
  const { page } = await openPage(browser, server.url + '/css/color.html');
  const tints = await page.$$eval('#palette [card*=":"]', els => els.map(el => el.getAttribute('card')));
  assert.ok(tints.length >= 70, `found ${tints.length} tints`);
  for (const dark of [false, true]) {
    await page.evaluate(d => d ? document.body.setAttribute('dark', '') : document.body.removeAttribute('dark'), dark);
    const low = [];
    for (const tint of tints) {
      const ratio = await contrastOfCard(page, `#palette [card="${tint}"]`);
      if (ratio < 4) low.push(`${tint} ${ratio.toFixed(2)}`);
    }
    assert.deepEqual(low, [], `${dark ? 'dark' : 'light'} page`);
  }
});
