// End-to-end check in a real Chrome/Chromium: every page and interaction, plus screenshots.
// Usage: npm run e2e   (set CHROME_PATH if Chrome is not found automatically)
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { server } from '../tools/serve.mjs';
import { destinations } from '../js/data.js';
import { filterDestinations } from '../js/logic.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const shots = resolve(root, 'docs/screenshots');
mkdirSync(shots, { recursive: true });
await new Promise((r) => server.listen(0, r));
const BASE = `http://localhost:${server.address().port}/`;

const chrome = [process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].filter(Boolean).find(existsSync);
const browser = await chromium.launch({ executablePath: chrome, args: ['--no-sandbox'] });
const results = [];
let page;
async function step(name, fn) {
  try { await fn(); results.push(true); console.log(`  ✔ ${name}`); }
  catch (e) { results.push(false); console.log(`  ✘ ${name}\n    ${e.message.split('\n')[0]}`); }
}
const cards = () => page.locator('.dest-card').count();
async function fullShot(name) {
  await page.addStyleTag({ content: '.site-header,.summary,.filters,.detail-body .panel{position:static!important}' });
  await page.evaluate(async () => { document.querySelectorAll('img').forEach((i) => { i.loading = 'eager'; }); await Promise.all([...document.images].map((i) => i.complete || new Promise((r) => { i.onload = i.onerror = r; }))); });
  await page.screenshot({ path: `${shots}/${name}.png`, fullPage: true });
}

try {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('dialog', (d) => d.accept());

  await step('home page renders hero, trip styles and featured packages', async () => {
    await page.goto(BASE);
    await page.getByRole('heading', { level: 1 }).waitFor();
    assert.equal(await page.locator('.type-tile').count(), 7);
    assert.equal(await cards(), 6);
    await fullShot('01-home');
  });

  await step('home search goes to filtered listing', async () => {
    await page.getByLabel('Where to?').fill('beach');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForURL(/#\/destinations\?q=beach/);
    const expected = filterDestinations(destinations, { q: 'beach' }).length;
    await page.waitForFunction((n) => document.querySelectorAll('.dest-card').length === n, expected);
  });

  await step('filters: region, trip style, month, price slider and sort', async () => {
    await page.goto(BASE + '#/destinations');
    await page.waitForFunction(() => document.querySelectorAll('.dest-card').length === 12);
    await page.getByLabel('Kerala').check();
    await page.waitForFunction(() => document.querySelectorAll('.dest-card').length === 4);
    await page.getByLabel('Trip style').selectOption('Beach');
    await page.waitForFunction(() => document.querySelectorAll('.dest-card').length === 1);
    await page.getByRole('button', { name: 'Clear all' }).click();
    await page.waitForFunction(() => document.querySelectorAll('.dest-card').length === 12);
    await page.getByLabel('Travel month').selectOption('7');
    const july = await cards();
    assert.ok(july > 0 && july < 12);
    await page.getByLabel('Travel month').selectOption('');
    await page.locator('input[name=maxPrice]').fill('20000');
    await page.waitForFunction(() => [...document.querySelectorAll('.card-foot strong')].every((s) => Number(s.textContent.replace(/\D/g, '')) <= 20000));
    await page.getByLabel('Sort').selectOption('price-desc');
    const prices = await page.locator('.card-foot strong').allTextContents();
    const nums = prices.map((p) => Number(p.replace(/\D/g, '')));
    assert.deepEqual(nums, [...nums].sort((a, b) => b - a));
    assert.match(page.url(), /maxPrice=20000/);
    assert.match(page.url(), /sort=price-desc/);
    await page.screenshot({ path: `${shots}/02-destinations-filtered.png` });
  });

  await step('filters restore from the URL and show an empty state', async () => {
    await page.goto(BASE + '#/destinations?region=International&type=Wildlife');
    await page.getByText('No packages match these filters').waitFor();
    await page.locator('[data-results] [data-clear]').click();
    await page.waitForFunction(() => document.querySelectorAll('.dest-card').length === 12);
  });

  await step('destination details: gallery, itinerary, tiers', async () => {
    await page.goto(BASE + '#/destinations/alleppey-houseboat');
    await page.getByRole('heading', { level: 1, name: 'Alleppey Houseboat' }).waitFor();
    await page.getByRole('button', { name: 'Show image 3' }).click();
    assert.match(await page.locator('.gallery-main').getAttribute('src'), /-3\.svg$/);
    assert.equal(await page.locator('.itinerary li').count(), 3);
    assert.equal(await page.locator('.tiers li').count(), 3);
    await page.getByRole('button', { name: 'Show image 1' }).click();
    await fullShot('03-destination-detail');
  });

  await step('unknown destination shows not-found', async () => {
    await page.goto(BASE + '#/destinations/atlantis');
    await page.getByRole('heading', { name: 'Page not found' }).waitFor();
  });

  await step('booking: validation errors, live estimate, submit and confirmation', async () => {
    await page.goto(BASE + '#/destinations/munnar');
    await page.getByRole('link', { name: 'Enquire now' }).click();
    await page.waitForURL(/#\/booking\?destination=munnar/);
    assert.equal(await page.getByLabel('Destination *').inputValue(), 'munnar');
    const total1 = await page.locator('[data-total]').textContent();
    await page.getByRole('button', { name: 'More adults' }).click();
    await page.waitForFunction((t) => document.querySelector('[data-total]').textContent !== t, total1);
    await page.getByLabel('Package *').selectOption('premium');
    await page.getByRole('button', { name: 'Send enquiry' }).click();
    await page.getByText(/Please fix 4 fields/).waitFor();
    assert.equal(await page.locator('#f-name').getAttribute('aria-invalid'), 'true');
    await fullShot('04-booking-validation');
    await page.getByLabel('Full name *').fill('Asha Menon');
    await page.getByLabel('Email *').fill('asha@example.com');
    await page.getByLabel('Phone *').fill('+91 98765 43210');
    await page.getByLabel(/I agree to be contacted/).check();
    await page.getByRole('button', { name: 'Send enquiry' }).click();
    await page.waitForURL(/#\/booking\/confirmed\?ref=GMT-/);
    await page.getByRole('heading', { name: 'Enquiry received' }).waitFor();
    assert.match(await page.locator('[data-ref]').textContent(), /^GMT-/);
    await fullShot('05-booking-confirmed');
  });

  await step('enquiry is listed, counted in the header and can be removed', async () => {
    assert.equal(await page.locator('[data-enquiry-count]').textContent(), '1');
    await page.getByRole('link', { name: 'View my enquiries' }).click();
    await page.locator('article.enquiry').waitFor();
    await page.screenshot({ path: `${shots}/06-my-enquiries.png` });
    await page.getByRole('button', { name: 'Remove' }).click();
    await page.getByText('No enquiries yet').waitFor();
    assert.equal(await page.locator('[data-enquiry-count]').isHidden(), true);
  });

  await step('mobile: menu toggles and navigates, layout fits the screen', async () => {
    const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const mp = await m.newPage();
    await mp.goto(BASE);
    await mp.getByRole('heading', { level: 1 }).waitFor();
    assert.equal(await mp.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'no horizontal scroll');
    await mp.screenshot({ path: `${shots}/07-mobile-home.png` });
    await mp.getByRole('button', { name: 'Open menu' }).click();
    await mp.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Destinations' }).waitFor();
    await mp.screenshot({ path: `${shots}/08-mobile-menu.png` });
    await mp.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Destinations' }).click();
    await mp.waitForURL(/#\/destinations$/);
    assert.equal(await mp.getByRole('button', { name: 'Open menu' }).getAttribute('aria-expanded'), 'false');
    assert.equal(await mp.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'listing: no horizontal scroll');
    await m.close();
  });

  await step('no JavaScript errors in the console', async () => { assert.deepEqual(errors, []); });
} finally {
  await browser.close();
  server.close();
}
const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} checks passed. Screenshots in docs/screenshots/`);
process.exit(failed ? 1 : 0);
