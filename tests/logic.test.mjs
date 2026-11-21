import { test } from 'node:test';
import assert from 'node:assert/strict';
import { destinations } from '../js/data.js';
import { filterDestinations, sortDestinations, estimatePrice, validateBooking, isPeakDate, makeReference, parseHash, addDays, formatINR } from '../js/logic.js';

const munnar = destinations.find((d) => d.slug === 'munnar');

test('sample data is complete and consistent', () => {
  const slugs = new Set();
  for (const d of destinations) {
    assert.ok(!slugs.has(d.slug), `duplicate slug ${d.slug}`);
    slugs.add(d.slug);
    assert.equal(d.itinerary.length, d.nights + 1, `${d.slug}: itinerary should have nights + 1 days`);
    assert.ok(d.priceFrom > 0 && d.bestMonths.every((m) => m >= 1 && m <= 12));
  }
});

test('filters by region, type, price, nights and month', () => {
  assert.ok(filterDestinations(destinations, { region: 'Kerala' }).every((d) => d.region === 'Kerala'));
  assert.ok(filterDestinations(destinations, { type: 'Beach' }).every((d) => d.types.includes('Beach')));
  assert.ok(filterDestinations(destinations, { maxPrice: 15000 }).every((d) => d.priceFrom <= 15000));
  assert.ok(filterDestinations(destinations, { maxNights: 3 }).every((d) => d.nights <= 3));
  assert.ok(filterDestinations(destinations, { month: 7 }).every((d) => d.bestMonths.includes(7)));
  assert.equal(filterDestinations(destinations, {}).length, destinations.length);
});

test('text search matches all words, case-insensitive, across name, country and highlights', () => {
  assert.deepEqual(filterDestinations(destinations, { q: 'HOUSEBOAT' }).map((d) => d.slug), ['alleppey-houseboat']);
  assert.deepEqual(filterDestinations(destinations, { q: 'desert safari' }).map((d) => d.slug), ['dubai']);
  assert.equal(filterDestinations(destinations, { q: 'nowhere-at-all' }).length, 0);
});

test('sorting', () => {
  const asc = sortDestinations(destinations, 'price-asc').map((d) => d.priceFrom);
  assert.deepEqual(asc, [...asc].sort((a, b) => a - b));
  assert.equal(sortDestinations(destinations, 'popular')[0].rating, Math.max(...destinations.map((d) => d.rating)));
  assert.notEqual(sortDestinations(destinations, 'name'), destinations, 'returns a new array');
});

test('price estimate: two adults, standard tier, off-peak', () => {
  const e = estimatePrice(munnar, { adults: 2, children: 0, tier: 'standard', startDate: '2026-08-10' });
  // 2 × 11,500 = 23,000; GST 5% = 1,150
  assert.equal(e.total, 24150);
  assert.equal(e.lines.at(-1).label, 'GST (5%)');
});

test('price estimate: children, premium tier, single supplement and peak surcharge', () => {
  const fam = estimatePrice(munnar, { adults: 2, children: 1, tier: 'premium', startDate: '2026-08-10' });
  const per = 11500 * 1.8;
  assert.equal(fam.total, Math.round(2 * per) + Math.round(per * 0.6) + Math.round((2 * per + per * 0.6) * 0.05));
  const solo = estimatePrice(munnar, { adults: 1, tier: 'standard', startDate: '2026-12-24' });
  assert.ok(solo.lines.some((l) => l.label.startsWith('Single room')));
  assert.ok(solo.lines.some((l) => l.label.startsWith('Peak season')));
});

test('peak dates are 20 Dec to 5 Jan', () => {
  assert.ok(isPeakDate('2026-12-20') && isPeakDate('2027-01-05'));
  assert.ok(!isPeakDate('2026-12-19') && !isPeakDate('2027-01-06') && !isPeakDate(''));
});

test('booking validation', () => {
  const ok = { destination: 'munnar', startDate: '2026-03-01', adults: 2, children: 0, tier: 'comfort', name: 'Asha Menon', email: 'asha@example.com', phone: '+91 98765 43210', consent: true };
  assert.equal(validateBooking(ok, '2026-01-01').valid, true);
  const bad = validateBooking({ ...ok, destination: '', startDate: '2025-12-01', adults: 0, email: 'x@', phone: '12', consent: false, tier: 'gold' }, '2026-01-01');
  assert.deepEqual(Object.keys(bad.errors).sort(), ['adults', 'consent', 'destination', 'email', 'phone', 'startDate', 'tier']);
  assert.ok(validateBooking({ ...ok, startDate: '2027-06-01' }, '2026-01-01').errors.startDate.includes('12 months'));
});

test('helpers', () => {
  assert.match(makeReference(), /^GMT-[A-HJ-NP-Z2-9]{6}$/);
  assert.deepEqual(parseHash('#/destinations?region=Kerala&q=tea'), { path: '/destinations', params: { region: 'Kerala', q: 'tea' } });
  assert.deepEqual(parseHash(''), { path: '/', params: {} });
  assert.equal(addDays('2026-12-30', 3), '2027-01-02');
  assert.equal(formatINR(1234567), '₹12,34,567');
});
