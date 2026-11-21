import { destinations, REGIONS, TRIP_TYPES, MONTHS, PACKAGE_TIERS, PHOTOS, HERO_PHOTO, CTA_PHOTO, photoUrl } from './data.js';
import { filterDestinations, sortDestinations, estimatePrice, formatINR, validateBooking, makeReference, parseHash, addDays } from './logic.js';
import { icon, TYPE_ICON } from './icons.js';

let app = document.getElementById('main'); // replaced on every render
const STORAGE_KEY = 'gomato.enquiries.v1';
const bySlug = Object.fromEntries(destinations.map((d) => [d.slug, d]));
const PRICE_MAX = Math.ceil(Math.max(...destinations.map((d) => d.priceFrom)) / 5000) * 5000;

// ------------------------------------------------------------------ helpers
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const img = (d, n = 1, w = 1200) => photoUrl(PHOTOS[d.slug][n - 1], w);
const srcset = (d, n = 1) => [480, 800, 1200].map((w) => `${img(d, n, w)} ${w}w`).join(', ');
const today = () => new Date().toISOString().slice(0, 10);

function loadEnquiries() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; } catch { return []; }
}
function saveEnquiries(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); return true; } catch { return false; }
}
function updateBadge() {
  const n = loadEnquiries().length;
  const b = document.querySelector('[data-enquiry-count]');
  if (b) { b.textContent = n; b.hidden = n === 0; }
}
function toast(msg) {
  const t = document.querySelector('.toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { t.hidden = true; }, 3200);
}
function setHash(path, params = {}) {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)).toString();
  const next = `#${path}${q ? `?${q}` : ''}`;
  if (location.hash !== next) history.replaceState(null, '', next);
}

// ------------------------------------------------------------------ components
function card(d) {
  return `<article class="card dest-card">
    <a href="#/destinations/${d.slug}" class="card-link" aria-label="${esc(d.name)}: view package details">
      <div class="card-media">
        <img src="${img(d, 1, 800)}" srcset="${srcset(d)}" sizes="(max-width: 700px) 100vw, 400px" alt="${esc(d.name)}" width="800" height="600" loading="lazy">
        <span class="chip chip-light">${icon(TYPE_ICON[d.types[0]], 14)}${esc(d.types[0])}</span>
        <span class="rating">${icon('star', 14)}${d.rating.toFixed(1)}<span class="visually-hidden"> out of 5</span></span>
      </div>
      <div class="card-body">
        <p class="card-kicker">${icon('pin', 14)}${esc(d.region === 'International' ? d.country : d.region === 'Kerala' ? 'Kerala, India' : 'India')}</p>
        <h3>${esc(d.name)}</h3>
        <p class="muted card-summary">${esc(d.summary)}</p>
        <div class="card-foot">
          <span class="duration">${icon('moon', 15)}${d.nights}N / ${d.nights + 1}D</span>
          <span class="price"><small>from</small> <strong>${formatINR(d.priceFrom)}</strong></span>
        </div>
      </div>
    </a>
  </article>`;
}

function searchForm(params = {}) {
  return `<form class="search-bar" data-search role="search" aria-label="Find a holiday">
    <label class="field"><span>${icon('search', 16)} Where to?</span><input name="q" type="search" placeholder="Munnar, beach, Dubai…" value="${esc(params.q ?? '')}"></label>
    <label class="field"><span>${icon('calendar', 16)} Travel month</span>
      <select name="month"><option value="">Any month</option>${MONTHS.map((m, i) => `<option value="${i + 1}" ${String(params.month) === String(i + 1) ? 'selected' : ''}>${m}</option>`).join('')}</select></label>
    <label class="field"><span>${icon('globe', 16)} Region</span>
      <select name="region"><option value="">Anywhere</option>${REGIONS.map((r) => `<option ${params.region === r ? 'selected' : ''}>${r}</option>`).join('')}</select></label>
    <button class="btn btn-primary" type="submit">${icon('search', 18)} Search</button>
  </form>`;
}

// ------------------------------------------------------------------ pages
function homePage() {
  const featured = sortDestinations(destinations, 'popular').slice(0, 6);
  const trending = ['alleppey-houseboat', 'maldives', 'munnar', 'dubai', 'jaipur-udaipur'].map((s) => bySlug[s]);
  const regionCard = (r, slug, blurb) => {
    const n = destinations.filter((d) => d.region === r).length;
    return `<a class="region-card" href="#/destinations?region=${encodeURIComponent(r)}">
      <img src="${img(bySlug[slug], 1, 900)}" alt="" width="900" height="1100" loading="lazy">
      <span class="region-text"><strong>${r}</strong><small>${blurb} · ${n} packages</small><span class="region-cta">Explore ${icon('arrow', 16)}</span></span>
    </a>`;
  };
  return `
  <section class="hero">
    <img class="hero-bg" src="${photoUrl(HERO_PHOTO, 1920)}" srcset="${[800, 1280, 1920].map((w) => `${photoUrl(HERO_PHOTO, w)} ${w}w`).join(', ')}" sizes="100vw" alt="Houseboat on the Kerala backwaters" width="1920" height="1080" fetchpriority="high">
    <div class="container hero-inner">
      <p class="hero-kicker">${icon('pin', 16)} Kerala specialists · India · International</p>
      <h1>Find your perfect holiday, planned end to end.</h1>
      <p class="lead">Handpicked packages with stays, transfers and sightseeing. Compare tiers, see an itemised price and enquire in minutes.</p>
    </div>
  </section>
  <div class="container search-wrap">${searchForm()}</div>

  <section class="section">
    <div class="container">
      <div class="section-head"><div><h2>Trending destinations</h2><p class="muted">Most-booked trips this season</p></div><a class="text-link" href="#/destinations">View all ${icon('arrow', 16)}</a></div>
      <div class="bento">
        ${trending.map((d, i) => `<a class="bento-tile${i === 0 ? ' bento-lg' : ''}" href="#/destinations/${d.slug}">
          <img src="${img(d, 1, i === 0 ? 1200 : 700)}" alt="" width="1200" height="800" loading="lazy">
          <span class="bento-text"><strong>${esc(d.name)}</strong><small>${d.nights} nights · from ${formatINR(d.priceFrom)}</small></span>
        </a>`).join('')}
      </div>
    </div>
  </section>

  <section class="section section-tint">
    <div class="container">
      <div class="section-head"><div><h2>Travel your way</h2><p class="muted">Pick a trip style to see matching packages</p></div></div>
      <div class="type-grid">
        ${TRIP_TYPES.map((t) => {
          const n = destinations.filter((d) => d.types.includes(t)).length;
          return `<a class="type-tile" href="#/destinations?type=${encodeURIComponent(t)}"><span class="type-icon">${icon(TYPE_ICON[t], 24)}</span><span><strong>${t}</strong><small>${n} package${n === 1 ? '' : 's'}</small></span></a>`;
        }).join('')}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head"><div><h2>Top-rated packages</h2><p class="muted">Highest-rated trips across all regions</p></div><a class="btn btn-ghost" href="#/destinations">All packages ${icon('arrow', 16)}</a></div>
      <div class="grid">${featured.map(card).join('')}</div>
    </div>
  </section>

  <section class="section section-tight">
    <div class="container region-grid">
      ${regionCard('Kerala', 'munnar', 'Hills, backwaters and beaches')}
      ${regionCard('Rest of India', 'jaipur-udaipur', 'Forts, mountains and islands')}
      ${regionCard('International', 'bali', 'Short-haul getaways abroad')}
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head center"><div><h2>Why book with Gomato</h2><p class="muted">Everything sorted before you pack</p></div></div>
      <ul class="features">
        ${[['route', 'Complete itineraries', 'Day-by-day plans with stays, transfers and sightseeing already worked out.'],
           ['wallet', 'Transparent pricing', 'Itemised estimates with child rates, peak surcharges and GST shown upfront.'],
           ['users', 'Three package tiers', 'Standard, Comfort or Premium stays to match your budget and pace.'],
           ['shield', 'Planner-confirmed', 'Every enquiry is checked for availability before anything is booked.']]
          .map(([ic, t, d]) => `<li><span class="feature-icon">${icon(ic, 24)}</span><h3>${t}</h3><p class="muted">${d}</p></li>`).join('')}
      </ul>
    </div>
  </section>

  <section class="cta-band">
    <img src="${photoUrl(CTA_PHOTO, 1600)}" alt="" width="1600" height="900" loading="lazy">
    <div class="container cta-inner">
      <h2>Not sure where to go yet?</h2>
      <p>Tell us your dates, group and budget and get an instant estimate for any package.</p>
      <a class="btn btn-primary btn-lg" href="#/booking">Plan my trip ${icon('arrow', 18)}</a>
    </div>
  </section>`;
}

function destinationsPage(params) {
  const state = {
    q: params.q ?? '', region: params.region ?? '', type: params.type ?? '', month: params.month ?? '',
    maxPrice: Number(params.maxPrice) || PRICE_MAX, maxNights: Number(params.maxNights) || 0, sort: params.sort ?? 'popular'
  };
  return `
  <section class="page-head"><div class="container">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span>/</span>Destinations</nav><h1>Holiday packages</h1>
    <p class="lead">${destinations.length} handpicked packages across Kerala, the rest of India and abroad.</p>
  </div></section>
  <section class="section section-tight"><div class="container listing">
    <aside class="filters" aria-label="Filters">
      <form data-filters>
        <div class="filters-head"><h2>${icon('filter', 18)} Filters</h2><button type="button" class="link-btn" data-clear>Clear all</button></div>
        <label class="field"><span>Search</span><input type="search" name="q" value="${esc(state.q)}" placeholder="Name, country or activity"></label>
        <fieldset class="field"><legend>Region</legend>
          <label class="radio"><input type="radio" name="region" value="" ${!state.region ? 'checked' : ''}> All regions</label>
          ${REGIONS.map((r) => `<label class="radio"><input type="radio" name="region" value="${r}" ${state.region === r ? 'checked' : ''}> ${r}</label>`).join('')}
        </fieldset>
        <label class="field"><span>Trip style</span><select name="type"><option value="">Any style</option>${TRIP_TYPES.map((t) => `<option ${state.type === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
        <label class="field"><span>Travel month</span><select name="month"><option value="">Any month</option>${MONTHS.map((m, i) => `<option value="${i + 1}" ${String(state.month) === String(i + 1) ? 'selected' : ''}>${m}</option>`).join('')}</select></label>
        <label class="field"><span>Max price per person: <output name="priceOut">${formatINR(state.maxPrice)}</output></span>
          <input type="range" name="maxPrice" min="10000" max="${PRICE_MAX}" step="2500" value="${state.maxPrice}"></label>
        <label class="field"><span>Trip length</span><select name="maxNights">
          <option value="0">Any length</option>${[3, 4, 5].map((n) => `<option value="${n}" ${state.maxNights === n ? 'selected' : ''}>Up to ${n} nights</option>`).join('')}</select></label>
      </form>
    </aside>
    <div>
      <div class="results-bar">
        <p class="muted" aria-live="polite" data-count></p>
        <label class="sort"><span>Sort</span><select name="sort" data-sort>
          ${[['popular', 'Top rated'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['duration', 'Shortest first'], ['name', 'Name A–Z']]
            .map(([v, l]) => `<option value="${v}" ${state.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      </div>
      <div class="grid" data-results></div>
    </div>
  </div></section>`;
}

function bindDestinations() {
  const form = app.querySelector('[data-filters]');
  const sortEl = app.querySelector('[data-sort]');
  const update = () => {
    const fd = new FormData(form);
    const f = {
      q: fd.get('q').trim(), region: fd.get('region'), type: fd.get('type'), month: fd.get('month'),
      maxPrice: Number(fd.get('maxPrice')), maxNights: Number(fd.get('maxNights'))
    };
    form.querySelector('output[name=priceOut]').textContent = formatINR(f.maxPrice);
    const list = sortDestinations(filterDestinations(destinations, {
      q: f.q, region: f.region, type: f.type, month: f.month === '' ? null : Number(f.month),
      maxPrice: f.maxPrice, maxNights: f.maxNights || Infinity
    }), sortEl.value);
    app.querySelector('[data-count]').textContent = `${list.length} package${list.length === 1 ? '' : 's'} found`;
    app.querySelector('[data-results]').innerHTML = list.length
      ? list.map(card).join('')
      : `<div class="empty">${icon('search', 32)}<h3>No packages match these filters</h3><p class="muted">Try a different month or a higher budget.</p><button type="button" class="btn btn-ghost" data-clear>Clear filters</button></div>`;
    setHash('/destinations', { q: f.q, region: f.region, type: f.type, month: f.month,
      maxPrice: f.maxPrice < PRICE_MAX ? f.maxPrice : '', maxNights: f.maxNights || '', sort: sortEl.value !== 'popular' ? sortEl.value : '' });
  };
  let t;
  form.addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(update, e.target.type === 'search' ? 200 : 0); });
  form.addEventListener('submit', (e) => e.preventDefault());
  sortEl.addEventListener('change', update);
  app.addEventListener('click', (e) => {
    if (!e.target.closest('[data-clear]')) return;
    form.reset();
    form.querySelector('[name=q]').value = '';
    form.querySelector('[name=region][value=""]').checked = true;
    form.querySelector('[name=type]').value = '';
    form.querySelector('[name=month]').value = '';
    form.querySelector('[name=maxPrice]').value = PRICE_MAX;
    form.querySelector('[name=maxNights]').value = '0';
    sortEl.value = 'popular';
    update();
  });
  update();
}

function detailPage(slug) {
  const d = bySlug[slug];
  if (!d) return notFound('We couldn’t find that destination.');
  document.title = `${d.name} holiday packages · Gomato Travel`;
  const months = MONTHS.map((m, i) => `<li class="${d.bestMonths.includes(i + 1) ? 'good' : ''}" title="${d.bestMonths.includes(i + 1) ? 'Good time to visit' : 'Off season'}">${m}</li>`).join('');
  const related = destinations.filter((x) => x.slug !== d.slug && x.types.some((t) => d.types.includes(t))).slice(0, 3);
  return `
  <article>
    <section class="container detail-head">
      <a class="back" href="#/destinations">${icon('back', 16)} All destinations</a>
      <div class="detail-title">
        <div><p class="eyebrow">${icon('pin', 15)} ${esc(d.region)} · ${esc(d.country)} <span class="rating-inline">${icon('star', 15)} ${d.rating.toFixed(1)}</span></p><h1>${esc(d.name)}</h1><p class="lead">${esc(d.summary)}</p></div>
        <div class="price-box"><small>Starting from</small><strong>${formatINR(d.priceFrom)}</strong><small>per person · ${d.nights} nights</small>
          <a class="btn btn-primary" href="#/booking?destination=${d.slug}">Enquire now</a></div>
      </div>
    </section>
    <section class="container gallery" data-gallery>
      <img class="gallery-main" src="${img(d, 1, 1400)}" data-n="1" alt="${esc(d.name)}, photo 1 of 3" width="1400" height="933">
      <div class="gallery-thumbs" role="group" aria-label="Choose photo">
        ${[1, 2, 3].map((n) => `<button type="button" data-img="${img(d, n, 1400)}" data-n="${n}" aria-label="Show image ${n}" aria-pressed="${n === 1}"><img src="${img(d, n, 500)}" alt="" width="500" height="333" loading="lazy"></button>`).join('')}
      </div>
    </section>
    <section class="container detail-body section-tight">
      <div>
        <h2>Overview</h2><p>${esc(d.description)}</p>
        <h3>Highlights</h3><ul class="checks">${d.highlights.map((h) => `<li>${icon('check', 18)}${esc(h)}</li>`).join('')}</ul>
        <h2>Day-by-day itinerary</h2>
        <ol class="itinerary">${d.itinerary.map((s, i) => `<li><span>Day ${i + 1}</span><p>${esc(s)}</p></li>`).join('')}</ol>
        <div class="two-col">
          <div><h3>Included</h3><ul class="checks">${d.inclusions.map((x) => `<li>${icon('check', 18)}${esc(x)}</li>`).join('')}</ul></div>
          <div><h3>Not included</h3><ul class="checks crosses">${d.exclusions.map((x) => `<li>${icon('x', 18)}${esc(x)}</li>`).join('')}</ul></div>
        </div>
      </div>
      <aside class="panel">
        <h3>Best time to visit</h3><ul class="months" aria-label="Months, highlighted when it is a good time to visit">${months}</ul>
        <h3>Trip style</h3><div class="chips">${d.types.map((t) => `<a class="chip" href="#/destinations?type=${encodeURIComponent(t)}">${icon(TYPE_ICON[t], 15)} ${t}</a>`).join('')}</div>
        <h3>Package tiers</h3>
        <ul class="tiers">${PACKAGE_TIERS.map((t) => `<li><span><strong>${t.name}</strong><small>${t.note}</small></span><span>${formatINR(d.priceFrom * t.multiplier)}</span></li>`).join('')}</ul>
        <p class="muted small">Per adult on twin sharing, before GST. Final price confirmed by your planner.</p>
        <a class="btn btn-primary btn-block" href="#/booking?destination=${d.slug}">Get a price estimate</a>
      </aside>
    </section>
    ${related.length ? `<section class="section section-tint"><div class="container"><h2>You might also like</h2><div class="grid">${related.map(card).join('')}</div></div></section>` : ''}
  </article>`;
}

function bindDetail() {
  const g = app.querySelector('[data-gallery]');
  if (!g) return;
  g.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-img]');
    if (!b) return;
    const main = g.querySelector('.gallery-main');
    main.src = b.dataset.img;
    main.dataset.n = b.dataset.n;
    main.alt = main.alt.replace(/photo \d/, `photo ${b.dataset.n}`);
    g.querySelectorAll('button[data-img]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  });
}

function bookingPage(params) {
  const start = addDays(today(), 30);
  const pre = bySlug[params.destination] ? params.destination : '';
  const field = (name, label, inputHtml, hint = '') => `<div class="field" data-field="${name}"><label for="f-${name}">${label}</label>${inputHtml}${hint ? `<small class="hint">${hint}</small>` : ''}<small class="error" id="e-${name}" aria-live="polite"></small></div>`;
  return `
  <section class="page-head"><div class="container"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span>/</span>Plan a trip</nav><h1>Plan your trip</h1>
    <p class="lead">Tell us when and who is travelling. You will see an itemised estimate before you send the enquiry.</p></div></section>
  <section class="section section-tight"><div class="container booking">
    <form class="panel form" data-booking novalidate>
      <h2>1. Trip details</h2>
      ${field('destination', 'Destination *', `<select id="f-destination" name="destination" aria-describedby="e-destination"><option value="">Choose a destination</option>
        ${REGIONS.map((r) => `<optgroup label="${r}">${destinations.filter((d) => d.region === r).map((d) => `<option value="${d.slug}" ${pre === d.slug ? 'selected' : ''}>${esc(d.name)} (${d.nights}N)</option>`).join('')}</optgroup>`).join('')}</select>`)}
      <div class="row">
        ${field('startDate', 'Start date *', `<input id="f-startDate" type="date" name="startDate" value="${start}" min="${addDays(today(), 1)}" max="${addDays(today(), 365)}" aria-describedby="e-startDate">`)}
        ${field('tier', 'Package *', `<select id="f-tier" name="tier">${PACKAGE_TIERS.map((t) => `<option value="${t.id}">${t.name}: ${t.note}</option>`).join('')}</select>`)}
      </div>
      <div class="row">
        ${field('adults', 'Adults (12+) *', `<div class="stepper"><button type="button" data-step="adults" data-delta="-1" aria-label="Fewer adults">−</button><input id="f-adults" name="adults" type="number" min="1" max="12" value="2" inputmode="numeric" aria-describedby="e-adults"><button type="button" data-step="adults" data-delta="1" aria-label="More adults">+</button></div>`)}
        ${field('children', 'Children (5–11)', `<div class="stepper"><button type="button" data-step="children" data-delta="-1" aria-label="Fewer children">−</button><input id="f-children" name="children" type="number" min="0" max="8" value="0" inputmode="numeric" aria-describedby="e-children"><button type="button" data-step="children" data-delta="1" aria-label="More children">+</button></div>`, 'Under-5s travel free')}
      </div>
      <h2>2. Your details</h2>
      ${field('name', 'Full name *', '<input id="f-name" name="name" autocomplete="name" aria-describedby="e-name">')}
      <div class="row">
        ${field('email', 'Email *', '<input id="f-email" name="email" type="email" autocomplete="email" aria-describedby="e-email">')}
        ${field('phone', 'Phone *', '<input id="f-phone" name="phone" type="tel" autocomplete="tel" placeholder="+91 98xxx xxxxx" aria-describedby="e-phone">')}
      </div>
      ${field('notes', 'Anything else?', '<textarea id="f-notes" name="notes" rows="3" maxlength="600" placeholder="Celebrations, dietary needs, pace of travel…"></textarea>')}
      <div class="field" data-field="consent"><label class="check"><input type="checkbox" name="consent"> I agree to be contacted about this enquiry. *</label><small class="error" id="e-consent" aria-live="polite"></small></div>
      <div class="form-error" role="alert" hidden></div>
      <button class="btn btn-primary btn-lg" type="submit">Send enquiry</button>
      <p class="muted small">No payment is taken now. A planner confirms availability and the final price before anything is booked.</p>
    </form>
    <aside class="panel summary" aria-live="polite" data-summary></aside>
  </div></section>`;
}

function readBooking(form) {
  const fd = new FormData(form);
  return {
    destination: fd.get('destination'), startDate: fd.get('startDate'), tier: fd.get('tier'),
    adults: Number(fd.get('adults')), children: Number(fd.get('children') || 0),
    name: fd.get('name').trim(), email: fd.get('email').trim(), phone: fd.get('phone').trim(),
    notes: fd.get('notes').trim(), consent: fd.get('consent') === 'on'
  };
}

function renderSummary(data) {
  const d = bySlug[data.destination];
  if (!d) return `<h2>Price estimate</h2><p class="muted">Choose a destination to see an estimate.</p>`;
  const est = estimatePrice(d, data);
  const end = data.startDate ? addDays(data.startDate, d.nights) : '';
  return `<img src="${img(d, 1, 800)}" alt="" width="800" height="533"><h2>${esc(d.name)}</h2>
    <ul class="meta"><li>${icon('moon', 16)}${d.nights} nights</li>${end ? `<li>${icon('calendar', 16)}${data.startDate} → ${end}</li>` : ''}<li>${icon('users', 16)}${data.adults + data.children} traveller${data.adults + data.children === 1 ? '' : 's'}</li></ul>
    <table class="estimate"><caption class="visually-hidden">Price estimate</caption><tbody>
      ${est.lines.map((l) => `<tr><td>${esc(l.label)}</td><td>${formatINR(l.amount)}</td></tr>`).join('')}
    </tbody><tfoot><tr><th scope="row">Estimated total</th><td data-total>${formatINR(est.total)}</td></tr></tfoot></table>
    <p class="muted small">${est.tier.name} package. Estimate; final price depends on availability.</p>`;
}

function bindBooking() {
  const form = app.querySelector('[data-booking]');
  const summary = app.querySelector('[data-summary]');
  const showErrors = (errors) => {
    form.querySelectorAll('[data-field]').forEach((f) => {
      const name = f.dataset.field;
      const msg = errors[name] ?? '';
      f.classList.toggle('has-error', Boolean(msg));
      const el = f.querySelector('.error');
      if (el) el.textContent = msg;
      const input = f.querySelector('input, select, textarea');
      if (input) input.setAttribute('aria-invalid', String(Boolean(msg)));
    });
  };
  const refresh = () => { summary.innerHTML = renderSummary(readBooking(form)); };
  form.addEventListener('input', () => {
    refresh();
    if (form.dataset.submitted) showErrors(validateBooking(readBooking(form), today()).errors);
  });
  form.addEventListener('click', (e) => {
    const b = e.target.closest('[data-step]');
    if (!b) return;
    const input = form.elements[b.dataset.step];
    const next = Math.min(Number(input.max), Math.max(Number(input.min), Number(input.value || 0) + Number(b.dataset.delta)));
    input.value = next;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.dataset.submitted = '1';
    const data = readBooking(form);
    const { valid, errors } = validateBooking(data, today());
    showErrors(errors);
    const banner = form.querySelector('.form-error');
    if (!valid) {
      banner.hidden = false;
      banner.textContent = `Please fix ${Object.keys(errors).length} field${Object.keys(errors).length === 1 ? '' : 's'} highlighted below.`;
      form.querySelector('.has-error input, .has-error select, .has-error textarea')?.focus();
      return;
    }
    banner.hidden = true;
    const d = bySlug[data.destination];
    const est = estimatePrice(d, data);
    const enquiry = { ...data, reference: makeReference(), destinationName: d.name, nights: d.nights, total: est.total, createdAt: new Date().toISOString(), status: 'Received' };
    const list = loadEnquiries();
    list.unshift(enquiry);
    if (!saveEnquiries(list)) toast('Your browser blocked storage, so this enquiry will not be kept after you leave the page.');
    updateBadge();
    try { sessionStorage.setItem('gomato.last', JSON.stringify(enquiry)); } catch { /* storage unavailable */ }
    location.hash = `#/booking/confirmed?ref=${enquiry.reference}`;
  });
  refresh();
}

function confirmedPage(params) {
  let e = null;
  try { e = JSON.parse(sessionStorage.getItem('gomato.last')); } catch { /* ignore */ }
  if (!e || e.reference !== params.ref) e = loadEnquiries().find((x) => x.reference === params.ref);
  if (!e) return notFound('We could not find that enquiry in this browser.');
  return `<section class="section"><div class="container narrow confirm">
    <div class="confirm-icon">${icon('check', 40)}</div>
    <h1>Enquiry received</h1>
    <p class="lead">Reference <strong data-ref>${esc(e.reference)}</strong></p>
    <p class="muted">Thanks, ${esc(e.name.split(' ')[0])}. Next, a travel planner checks availability for your dates and gets back to you to confirm the itinerary and final price. Nothing has been booked or charged yet.</p>
    <dl class="summary-list">
      <div><dt>Destination</dt><dd>${esc(e.destinationName)} (${e.nights} nights)</dd></div>
      <div><dt>Dates</dt><dd>${esc(e.startDate)} → ${addDays(e.startDate, e.nights)}</dd></div>
      <div><dt>Travellers</dt><dd>${e.adults} adult${e.adults === 1 ? '' : 's'}${e.children ? `, ${e.children} child${e.children === 1 ? '' : 'ren'}` : ''}</dd></div>
      <div><dt>Package</dt><dd>${esc(PACKAGE_TIERS.find((t) => t.id === e.tier)?.name)}</dd></div>
      <div><dt>Estimated total</dt><dd>${formatINR(e.total)}</dd></div>
      <div><dt>Contact</dt><dd>${esc(e.name)} · ${esc(e.email)}</dd></div>
    </dl>
    <div class="actions"><a class="btn btn-primary" href="#/enquiries">View my enquiries</a><a class="btn btn-ghost" href="#/destinations">Keep browsing</a></div>
  </div></section>`;
}

function enquiriesPage() {
  const list = loadEnquiries();
  return `<section class="page-head"><div class="container"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span>/</span>My enquiries</nav><h1>My enquiries</h1><p class="lead">Trips you have enquired about from this device.</p></div></section>
  <section class="section section-tight"><div class="container">
    ${list.length ? `<div class="enquiry-list">${list.map((e) => `
      <article class="panel enquiry" data-ref="${esc(e.reference)}">
        ${bySlug[e.destination] ? `<img src="${img(bySlug[e.destination], 1, 500)}" alt="" width="500" height="333">` : ''}
        <div><h2>${esc(e.destinationName)}</h2><p class="muted">${esc(e.reference)} · sent ${new Date(e.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          <ul class="meta"><li>${icon('calendar', 16)}${esc(e.startDate)}</li><li>${icon('users', 16)}${e.adults + e.children} travellers</li><li>${icon('wallet', 16)}${formatINR(e.total)}</li></ul></div>
        <div class="enquiry-actions"><span class="chip chip-status">${esc(String(e.status).replace(' (demo)', ''))}</span><button type="button" class="btn btn-ghost btn-sm" data-remove="${esc(e.reference)}">${icon('trash', 16)} Remove</button></div>
      </article>`).join('')}</div>`
    : `<div class="empty">${icon('route', 32)}<h2>No enquiries yet</h2><p class="muted">Enquiries you send from this browser will appear here.</p><a class="btn btn-primary" href="#/destinations">Browse destinations</a></div>`}
  </div></section>`;
}

function bindEnquiries() {
  app.addEventListener('click', (e) => {
    const b = e.target.closest('[data-remove]');
    if (!b) return;
    let ok = true;
    try { ok = window.confirm('Remove this enquiry?'); } catch { ok = true; }
    if (!ok) return;
    saveEnquiries(loadEnquiries().filter((x) => x.reference !== b.dataset.remove));
    updateBadge();
    toast('Enquiry removed.');
    render();
  });
}

function notFound(msg = 'The page you are looking for does not exist.') {
  return `<section class="section"><div class="container narrow empty"><h1>Page not found</h1><p class="muted">${esc(msg)}</p><a class="btn btn-primary" href="#/">Go to home</a></div></section>`;
}

// ------------------------------------------------------------------ router
function render() {
  const { path, params } = parseHash(location.hash);
  // Fresh element each render so listeners from the previous page are dropped
  const fresh = app.cloneNode(false);
  app.replaceWith(fresh);
  app = fresh;
  document.title = 'Gomato Travel · Holiday packages in Kerala, India and abroad';
  let html, bind;
  if (path === '/') html = homePage();
  else if (path === '/destinations') { html = destinationsPage(params); bind = bindDestinations; }
  else if (path.startsWith('/destinations/')) { html = detailPage(decodeURIComponent(path.split('/')[2])); bind = bindDetail; }
  else if (path === '/booking') { html = bookingPage(params); bind = bindBooking; }
  else if (path === '/booking/confirmed') html = confirmedPage(params);
  else if (path === '/enquiries') { html = enquiriesPage(); bind = bindEnquiries; }
  else html = notFound();
  fresh.innerHTML = html;
  bind?.();
  document.querySelectorAll('[data-nav]').forEach((a) => {
    const target = a.dataset.nav;
    const active = target === '/' ? path === '/' : path === target || path.startsWith(target + '/');
    a.classList.toggle('active', active);
    if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  closeMenu();
  window.scrollTo({ top: 0 });
  document.querySelector('.site-header').classList.toggle('on-hero', path === '/');
}

function closeMenu() {
  const btn = document.querySelector('.nav-toggle');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-label', 'Open menu');
  document.querySelector('.site-nav').classList.remove('open');
}

document.querySelector('.nav-toggle').addEventListener('click', (e) => {
  const btn = e.currentTarget;
  const open = btn.getAttribute('aria-expanded') !== 'true';
  btn.setAttribute('aria-expanded', String(open));
  btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.querySelector('.site-nav').classList.toggle('open', open);
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

// Home-page search submits to the listing page with filters in the URL
document.addEventListener('submit', (e) => {
  const f = e.target.closest('[data-search]');
  if (!f) return;
  e.preventDefault();
  const fd = new FormData(f);
  const q = new URLSearchParams([...fd].filter(([, v]) => v)).toString();
  location.hash = `#/destinations${q ? `?${q}` : ''}`;
});

window.addEventListener('hashchange', render);
document.querySelector('[data-year]').textContent = new Date().getFullYear();
updateBadge();
render();

// Header turns solid once the page scrolls past the hero
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
