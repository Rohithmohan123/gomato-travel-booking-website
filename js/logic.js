// Pure functions (no DOM) so they can be unit-tested in Node and reused by the UI.
import { PACKAGE_TIERS } from './data.js';

export const CHILD_RATE = 0.6; // children 5-11 pay 60% of the adult price
export const SINGLE_ROOM_SUPPLEMENT = 0.3; // +30% for a solo traveller in a single room
export const PEAK_SURCHARGE = 0.12; // +12% for Dec 20 - Jan 5 departures
export const GST_RATE = 0.05; // GST on tour packages, applied to the estimate for illustration

/** Filter destinations by text query, region, trip type, maximum price, maximum nights and month. */
export function filterDestinations(list, { q = '', region = '', type = '', maxPrice = Infinity, maxNights = Infinity, month = null } = {}) {
  const query = q.trim().toLowerCase();
  return list.filter((d) => {
    if (query) {
      const haystack = [d.name, d.country, d.region, d.summary, ...d.types, ...d.highlights].join(' ').toLowerCase();
      if (!query.split(/\s+/).every((word) => haystack.includes(word))) return false;
    }
    if (region && d.region !== region) return false;
    if (type && !d.types.includes(type)) return false;
    if (d.priceFrom > maxPrice) return false;
    if (d.nights > maxNights) return false;
    if (month !== null && month !== '' && !d.bestMonths.includes(Number(month))) return false;
    return true;
  });
}

export function sortDestinations(list, sort = 'popular') {
  const out = [...list];
  const by = {
    popular: (a, b) => b.rating - a.rating || a.priceFrom - b.priceFrom,
    'price-asc': (a, b) => a.priceFrom - b.priceFrom,
    'price-desc': (a, b) => b.priceFrom - a.priceFrom,
    duration: (a, b) => a.nights - b.nights || a.priceFrom - b.priceFrom,
    name: (a, b) => a.name.localeCompare(b.name)
  }[sort] || (() => 0);
  return out.sort(by);
}

export function isPeakDate(isoDate) {
  if (!isoDate) return false;
  const [, m, d] = isoDate.split('-').map(Number);
  return (m === 12 && d >= 20) || (m === 1 && d <= 5);
}

/** Itemised price estimate in INR. Amounts are rounded to the nearest rupee. */
export function estimatePrice(destination, { adults = 1, children = 0, tier = 'standard', startDate = '' } = {}) {
  const t = PACKAGE_TIERS.find((x) => x.id === tier) ?? PACKAGE_TIERS[0];
  const perAdult = destination.priceFrom * t.multiplier;
  const lines = [{ label: `${adults} adult${adults === 1 ? '' : 's'} × ${formatINR(perAdult)}`, amount: adults * perAdult }];
  if (children > 0) lines.push({ label: `${children} child${children === 1 ? '' : 'ren'} × ${formatINR(perAdult * CHILD_RATE)}`, amount: children * perAdult * CHILD_RATE });
  if (adults === 1 && children === 0) lines.push({ label: 'Single room supplement (30%)', amount: perAdult * SINGLE_ROOM_SUPPLEMENT });
  const base = lines.reduce((s, l) => s + l.amount, 0);
  if (isPeakDate(startDate)) lines.push({ label: 'Peak season surcharge (12%)', amount: base * PEAK_SURCHARGE });
  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  lines.push({ label: 'GST (5%)', amount: subtotal * GST_RATE });
  const rounded = lines.map((l) => ({ ...l, amount: Math.round(l.amount) }));
  return { lines: rounded, total: rounded.reduce((s, l) => s + l.amount, 0), tier: t };
}

export function formatINR(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export function addDays(isoDate, days) {
  const d = new Date(isoDate + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s-]{8,16}$/;

/** Validate a booking enquiry. `today` is injectable for tests. Returns { valid, errors }. */
export function validateBooking(form, today = new Date().toISOString().slice(0, 10)) {
  const errors = {};
  const adults = Number(form.adults);
  const children = Number(form.children || 0);
  if (!form.destination) errors.destination = 'Choose a destination.';
  if (!form.startDate) errors.startDate = 'Choose a travel date.';
  else if (form.startDate <= today) errors.startDate = 'Travel date must be in the future.';
  else if (form.startDate > addDays(today, 365)) errors.startDate = 'Enquiries can be made up to 12 months ahead.';
  if (!Number.isInteger(adults) || adults < 1 || adults > 12) errors.adults = 'Between 1 and 12 adults.';
  if (!Number.isInteger(children) || children < 0 || children > 8) errors.children = 'Between 0 and 8 children.';
  if (!PACKAGE_TIERS.some((t) => t.id === form.tier)) errors.tier = 'Choose a package.';
  if (!form.name || form.name.trim().length < 2) errors.name = 'Enter your full name.';
  if (!EMAIL_RE.test((form.email || '').trim())) errors.email = 'Enter a valid email address.';
  if (!PHONE_RE.test((form.phone || '').trim())) errors.phone = 'Enter a valid phone number.';
  if (!form.consent) errors.consent = 'Please agree to be contacted about this enquiry.';
  return { valid: Object.keys(errors).length === 0, errors };
}

/** Readable reference like GMT-7K3Q9P (no ambiguous characters). */
export function makeReference(random = Math.random) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(random() * chars.length)];
  return `GMT-${s}`;
}

/** Parse "#/path?x=1" into { path, params }. */
export function parseHash(hash) {
  const clean = (hash || '').replace(/^#/, '') || '/';
  const [path, query = ''] = clean.split('?');
  return { path: path || '/', params: Object.fromEntries(new URLSearchParams(query)) };
}
