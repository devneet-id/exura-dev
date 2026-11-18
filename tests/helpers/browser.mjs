// Playwright through createRequire: finds a local node_modules/playwright
// or a globally installed one (NODE_PATH), which ESM `import` would not.
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export async function startBrowser() {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  return browser;
}

// a page that fails the test on any uncaught error or console.error
// still: true turns CSS transitions off (exuracss animates `*`), so computed styles are final
export async function openPage(browser, url, { still = false } = {}) {
  const page = await browser.newPage();
  if (still) await page.addInitScript(stillScript);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(url);
  return { page, errors };
}

// injected before any page script: no transitions or animations
export const stillScript = () => {
  const css = '*, *::before, *::after { transition: none !important; animation: none !important; }';
  document.addEventListener('DOMContentLoaded', () => {
    const tag = document.createElement('style');
    tag.textContent = css;
    document.head.append(tag);
  });
};
