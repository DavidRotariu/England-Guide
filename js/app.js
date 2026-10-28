/* London, December 2026 — app shell.
   Reads window.TRIP (data/itinerary.js) and renders hash routes:
     #/            home (opens today's day during the trip, else a day picker)
     #/day/N       day timeline
     #/stop/ID     stop detail
     #/book        booking checklist
     #/tips        transport & general tips
     #/plan        timing clashes + every "Check before you go" item
   Testing: add ?today=2026-12-06 to the URL to pretend it's that date. */
(function () {
  "use strict";
  const TRIP = window.TRIP;
  const S = TRIP.settings;
  const TZ = S.timezone || "Europe/London";
  const $app = document.getElementById("app");
  const STORE_CHECK = "ldn26.checklist";
  const STORE_THEME = "ldn26.theme";

  /* ---------- storage (never throws) ---------- */
  const store = {
    get(k, fallback) { try { const v = localStorage.getItem(k); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
  };

  /* ---------- helpers ---------- */
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // Data strings may contain a little trusted inline HTML (<em>, <strong>, <a>), so they are inserted raw.
  const html = (s) => (s == null ? "" : String(s));
  const toMin = (hhmm) => { if (!hhmm) return null; const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
  const fmtClock = (date) => date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
  const pad = (n) => String(n).padStart(2, "0");

  function parseISO(iso) { const [y, m, d] = iso.split("-").map(Number); return { y, m, d }; }
  function addDays(iso, n) {
    const { y, m, d } = parseISO(iso);
    const t = new Date(Date.UTC(y, m - 1, d + n));
    return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
  }
  function fmtDate(iso, opts) {
    const { y, m, d } = parseISO(iso);
    return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString("en-GB", Object.assign({ timeZone: "UTC" }, opts));
  }
  const longDate = (iso) => fmtDate(iso, { weekday: "long", day: "numeric", month: "long" });
  const shortDate = (iso) => fmtDate(iso, { weekday: "short", day: "numeric", month: "short" });

  function todayISO() {
    const q = new URLSearchParams(location.search).get("today");
    if (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) return q;
    const p = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    return p; // en-CA gives YYYY-MM-DD
  }

  /* ---------- derived data ---------- */
  const days = TRIP.days.map((day, i) => {
    const n = i + 1;
    const date = addDays(S.day1Date, i);
    const { y, m, d } = parseISO(date);
    const sun = window.SunCalc.sunTimes(y, m, d, S.lat, S.lng);
    let num = 0;
    const items = day.items.map((it) => {
      const isStop = it.type !== "travel";
      return Object.assign({}, it, { dayN: n, no: isStop ? ++num : null });
    });
    return Object.assign({}, day, { n, date, sun, items, stops: items.filter((x) => x.no) });
  });
  const stopIndex = {};
  days.forEach((day) => day.stops.forEach((s, i) => { stopIndex[s.id] = { day, stop: s, i }; }));
  const sunsetMin = (day) => { const p = fmtClock(day.sun.sunset).split(":").map(Number); return p[0] * 60 + p[1]; };

  function dayForDate(iso) { return days.find((d) => d.date === iso) || null; }

  // Daylight status for a stop: null | "before" (needs light, OK) | "tight" (≤45 min before sunset) | "after"
  function daylight(stop, day) {
    if (stop.light !== "day") return null;
    const start = toMin(stop.suggestedTime || stop.time);
    if (start == null) return "before";
    const ss = sunsetMin(day);
    if (start >= ss) return "after";
    if (start >= ss - 45) return "tight";
    return "before";
  }

  /* ---------- icons ---------- */
  const I = {
    crest: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="32" cy="32" r="25" fill="none" stroke="currentColor" stroke-width=".8"/><g class="gold" fill="currentColor"><path d="M32 6 35 29 32 32 29 29Z"/><path d="M32 58 29 35 32 32 35 35Z" opacity=".55"/><path d="M6 32 29 29 32 32 29 35Z" opacity=".55"/><path d="M58 32 35 35 32 32 35 29Z" opacity=".55"/></g><g fill="currentColor"><path d="M32 32 45 19 36 30Z" opacity=".5"/><path d="M32 32 19 45 28 34Z" opacity=".5"/><path d="M32 32 19 19 30 28Z" opacity=".5"/><path d="M32 32 45 45 34 36Z" opacity=".5"/><circle cx="32" cy="32" r="2.6"/></g><text x="32" y="15.5" text-anchor="middle" font-size="6" font-family="Georgia,serif" fill="currentColor" font-weight="700">N</text></svg>`,
    moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>`,
    sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`,
    today: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><circle cx="12" cy="15" r="2" fill="currentColor"/></svg>`,
    days: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10"/></svg>`,
    book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 12 3 3 5-6"/></svg>`,
    tips: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>`,
    tick: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>`,
    eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>`,
    pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></svg>`,
    warn: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17v.5"/></svg>`,
    sunset: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M17 18a5 5 0 0 0-10 0M12 3v6M4.2 10.2l1.4 1.4M2 18h20M18.4 11.6l1.4-1.4M8 6l4-3 4 3"/></svg>`,
    tube: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="7"/><path d="M2 12h20"/></svg>`,
    walk: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="13" cy="4" r="2"/><path d="m9 21 3-7 3 3v4M7 12l3-4 4 1 2 3"/></svg>`,
    boat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 15h18l-2 4H5l-2-4ZM6 15V9h10l3 6M9 9V6h4v3"/></svg>`,
    train: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M8 21l2-4M16 21l-2-4"/><circle cx="9" cy="14" r=".8" fill="currentColor"/><circle cx="15" cy="14" r=".8" fill="currentColor"/></svg>`,
    cable: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 5l20 4M12 7v4"/><rect x="7" y="11" width="10" height="8" rx="2"/></svg>`,
    plane: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M10 17 8 21h2l4-4h4a2 2 0 0 0 0-4h-4l-4-4H8l2 4H6l-2-2H2l2 4-2 4h2l2-2h4Z"/></svg>`,
    car: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 16V11l2-5h10l2 5v5M3 16h18v3H3zM5 11h14"/></svg>`,
    left: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>`,
    note: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M8 11h8M8 15h6"/></svg>`,
  };
  const modeIcon = (mode) => I[{ tube: "tube", underground: "tube", walk: "walk", boat: "boat", train: "train", rail: "train", "cable car": "cable", cable: "cable", plane: "plane", taxi: "car", bus: "car", elizabeth: "train", dlr: "train" }[(mode || "").toLowerCase()] || "tube"];

  /* ---------- shell ---------- */
  function setHeader(day) {
    const now = document.getElementById("hdr-now");
    const kicker = document.getElementById("hdr-kicker");
    if (day) {
      kicker.textContent = TRIP.title;
      now.textContent = `Day ${day.n} · ${shortDate(day.date)}`;
    } else {
      kicker.textContent = TRIP.subtitle;
      now.textContent = TRIP.title;
    }
    const tabs = document.getElementById("daytabs");
    const t = todayISO();
    tabs.innerHTML = days.map((d) => `
      <a class="daytab" href="#/day/${d.n}" ${day && day.n === d.n ? 'aria-current="page"' : ""} aria-label="Day ${d.n}, ${esc(longDate(d.date))}">
        <b>Day ${d.n}</b><span>${esc(fmtDate(d.date, { weekday: "short", day: "numeric" }))}</span>
        ${d.date === t ? '<i class="today-dot" aria-label="today"></i>' : ""}
      </a>`).join("");
    const cur = tabs.querySelector('[aria-current="page"]');
    if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: "nearest", inline: "center" });
  }

  function setNav(route) {
    document.querySelectorAll(".bottomnav a").forEach((a) => {
      if (a.dataset.route === route) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    const open = checklistItems().filter((c) => !store.get(STORE_CHECK, {})[c.id]).length;
    const cnt = document.getElementById("book-count");
    cnt.textContent = open ? String(open) : "";
    cnt.hidden = !open;
  }

  /* ---------- bits ---------- */
  function badgesFor(stop, day) {
    const b = [];
    if (stop.free) b.push(`<span class="badge free">Free</span>`);
    if (stop.book) b.push(`<span class="badge book">Book ahead</span>`);
    const dl = daylight(stop, day);
    if (dl === "before") b.push(`<span class="badge daylight">${I.sunset}Best before dark</span>`);
    if (dl === "tight") b.push(`<span class="badge check">${I.sunset}Close to sunset ${fmtClock(day.sun.sunset)}</span>`);
    if (dl === "after") b.push(`<span class="badge check">${I.sunset}After sunset</span>`);
    if (stop.light === "night") b.push(`<span class="badge dark">${I.moon}Lovely after dark</span>`);
    if (stop.checks && stop.checks.length) b.push(`<span class="badge check">${I.warn}Check before you go</span>`);
    return b.length ? `<div class="badges">${b.join("")}</div>` : "";
  }

  function alertsHTML(alerts) {
    return (alerts || []).map((a) => `
      <section class="alert ${a.level === "minor" ? "minor" : ""}" role="note">
        <h3>${I.warn}<span>${esc(a.title)}</span></h3>
        ${html(a.html)}
      </section>`).join("");
  }

  function timeLabel(it) {
    if (!it.time) return it.when ? `<small>${esc(it.when)}</small>` : "";
    return `${esc(it.time)}${it.endTime ? `<small>–${esc(it.endTime)}</small>` : ""}`;
  }

  /* ---------- views ---------- */
  function viewHome() {
    const t = todayISO();
    const today = dayForDate(t);
    if (today) return viewDay(today.n, true);
    setHeader(null);
    const first = days[0].date, last = days[days.length - 1].date;
    const utc = (iso) => { const { y, m, d } = parseISO(iso); return Date.UTC(y, m - 1, d); };
    const diff = Math.round((utc(first) - utc(t)) / 86400000);
    let count;
    if (t < first) count = diff === 1 ? "Day 1 is tomorrow." : `${diff} days until Day 1.`;
    else if (t > last) count = "The trip is over. Hope London was kind to you.";
    else count = "";
    const openChecks = checklistItems().filter((c) => !store.get(STORE_CHECK, {})[c.id]).length;
    return `
      <div class="wrap">
        <section class="cover">
          <span class="crest-big">${I.crest}</span>
          <p class="sc muted">${esc(TRIP.subtitle)}</p>
          <h1>${esc(TRIP.title)}</h1>
          <p class="sub">${esc(TRIP.tagline)}</p>
          ${count ? `<p class="countdown">${esc(count)}</p>` : ""}
        </section>
        <hr class="rule ornament">
        <h2 class="section-title">The days</h2>
        <ul class="daylist">
          ${days.map((d) => `
            <li><a class="card" href="#/day/${d.n}">
              <span class="num">${d.n}</span>
              <span><h3>${esc(d.title)}</h3><span class="d">${esc(longDate(d.date))} · ${d.stops.length} stops</span></span>
              <span aria-hidden="true">›</span>
            </a></li>`).join("")}
        </ul>
        ${openChecks ? `<section class="alert" style="margin-top:20px"><h3>${I.book}<span>${openChecks} things still to book</span></h3><p><a href="#/book">Open the booking checklist</a> · <a href="#/plan">Plan check: clashes &amp; things to verify</a></p></section>` : ""}
        <p class="muted" style="font-size:.95rem;margin-top:18px">Staying near ${esc(TRIP.base.name)}. ${esc(TRIP.base.note || "")}</p>
      </div>`;
  }

  function viewDay(n, isToday) {
    const day = days[n - 1];
    if (!day) return viewNotFound();
    setHeader(day);
    const ss = fmtClock(day.sun.sunset), sr = fmtClock(day.sun.sunrise);
    const daylightStops = day.stops.filter((s) => s.light === "day");
    const rows = day.items.map((it) => {
      if (it.type === "travel") {
        return `<li class="tl-leg"><span class="leg-icon">${modeIcon(it.mode)}</span>
          <div class="leg-text">${it.time ? `<b>${esc(it.time)}</b> · ` : ""}<b>${esc(it.modeLabel || it.mode)}:</b> ${esc(it.from)} → ${esc(it.to)}${it.detail ? `<br>${html(it.detail)}` : ""}</div></li>`;
      }
      const notes = (it.myNotes || []).map((x) => `<p class="mynote">${html(x)}</p>`).join("");
      return `<li class="tl-item ${it.type}">
        <div class="tl-time">${timeLabel(it)}</div>
        <div class="tl-marker" aria-hidden="true">${it.no}</div>
        <a class="tl-card card" href="#/stop/${it.id}">
          <h3><span><span class="visually-hidden">Stop ${it.no}: </span>${esc(it.name)}</span><span class="chev" aria-hidden="true">›</span></h3>
          <p class="teaser">${html(it.teaser)}</p>
          ${notes}
          ${it.suggestedTime ? `<p class="suggested"><strong>Suggested:</strong> ${esc(it.suggestedTime)}${it.suggestedEnd ? "–" + esc(it.suggestedEnd) : ""}${it.suggestedWhy ? ` — ${html(it.suggestedWhy)}` : ""}</p>` : ""}
          ${badgesFor(it, day)}
        </a></li>`;
    }).join("");

    const prev = days[n - 2], next = days[n];
    return `
      <div class="wrap" data-swipe-day="${n}">
        <section class="day-hero">
          <p class="sc">${isToday ? "Today · " : ""}Day ${day.n} · ${esc(longDate(day.date))}</p>
          <h1>${esc(day.title)}</h1>
          <p class="sc muted" style="margin:0 0 4px">Today in a nutshell</p>
          <p class="nutshell">${html(day.nutshell)}</p>
          <div class="meta-grid">
            <div class="meta card"><span class="sc">Sunrise</span><span class="val">${sr}</span></div>
            <div class="meta card"><span class="sc">Sunset</span><span class="val">${ss}</span></div>
            <div class="meta card wide"><span class="sc">Neighbourhoods</span>
              <div class="chips">${day.neighbourhoods.map((x) => `<span class="chip">${esc(x)}</span>`).join("")}</div></div>
            ${daylightStops.length ? `<div class="meta card wide"><span class="sc">Best before dark (sunset ${ss})</span>
              <ul class="before-dark">${daylightStops.map((s) => {
                const st = daylight(s, day);
                return `<li><a href="#/stop/${s.id}">${esc(s.name)}</a> — ${esc(s.suggestedTime || s.time || "")}${st === "tight" ? " · <strong>cutting it close</strong>" : st === "after" ? " · <strong>after sunset</strong>" : ""}</li>`;
              }).join("")}</ul></div>` : ""}
          </div>
        </section>
        ${alertsHTML(day.alerts)}
        <h2 class="section-title">The route</h2>
        <ol class="timeline">${rows}</ol>
        <nav class="pager" aria-label="Other days">
          ${prev ? `<a class="card prev" href="#/day/${prev.n}"><span class="sc">‹ Day ${prev.n}</span><b>${esc(prev.title)}</b></a>` : ""}
          ${next ? `<a class="card next" href="#/day/${next.n}"><span class="sc">Day ${next.n} ›</span><b>${esc(next.title)}</b></a>` : ""}
        </nav>
        <p class="muted" style="text-align:center;font-size:.9rem">Swipe left or right to change day.</p>
      </div>`;
  }

  function practicalRows(p) {
    const labels = [["hours", "December hours"], ["cost", "Cost"], ["booking", "Booking"], ["station", "Nearest station"], ["allow", "Allow"], ["address", "Address"], ["extra", "Good to know"]];
    return labels.filter(([k]) => p[k]).map(([k, l]) => `<div class="row"><dt>${l}</dt><dd>${html(p[k])}</dd></div>`).join("");
  }

  function viewStop(id) {
    const ref = stopIndex[id];
    if (!ref) return viewNotFound();
    const { day, stop: s, i } = ref;
    setHeader(day);
    const isFood = s.type === "food";
    const mapsUrl = s.mapUrl || (s.mapQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.mapQuery)}` : null);
    const prev = day.stops[i - 1], next = day.stops[i + 1];
    const timeStr = s.time ? `${s.time}${s.endTime ? "–" + s.endTime : ""}` : (s.when || "");

    const notes = (s.myNotes && s.myNotes.length) ? `
      <aside class="note-to-self"><span class="sc">${I.note}Note to self</span>
        ${s.myNotes.map((x) => `<p>${html(x)}</p>`).join("")}
        ${s.suggestedTime ? `<p><strong>Suggested timing:</strong> ${esc(s.suggestedTime)}${s.suggestedEnd ? "–" + esc(s.suggestedEnd) : ""}${s.suggestedWhy ? ` — ${html(s.suggestedWhy)}` : ""}</p>` : ""}
      </aside>` : (s.suggestedTime ? `<aside class="note-to-self"><span class="sc">${I.note}Timing</span><p><strong>Suggested:</strong> ${esc(s.suggestedTime)}${s.suggestedEnd ? "–" + esc(s.suggestedEnd) : ""}${s.suggestedWhy ? ` — ${html(s.suggestedWhy)}` : ""}</p></aside>` : "");

    const checks = (s.checks || []).map((c) => `<div class="cbyg"><strong>Check before you go</strong>${html(c)}</div>`).join("");

    const food = isFood && s.food ? `
      <section class="card food-card">
        <div class="row"><span class="sc muted">Known for</span><span>${html(s.food.knownFor)}</span></div>
        <div class="row"><span class="sc muted">Order</span><span>${html(s.food.order)}</span></div>
        <div class="row"><span class="sc muted">Price</span><span>${html(s.food.price)}</span></div>
        ${s.food.alternatives ? `<div class="row"><span class="sc muted">Or try</span><span>${html(s.food.alternatives)}</span></div>` : ""}
      </section>` : "";

    const flight = s.type === "flight" ? flightHTML() : "";

    return `
      <article class="wrap">
        <a class="backlink" href="#/day/${day.n}">${I.left}Day ${day.n} timeline</a>
        <header class="stop-head">
          <p class="sc no">No. ${s.no} · ${esc(timeStr)}</p>
          <h1>${esc(s.name)}</h1>
          ${s.area ? `<p class="where">${esc(s.area)}</p>` : ""}
          ${badgesFor(s, day)}
        </header>
        ${alertsHTML(s.alerts)}
        ${notes}
        ${food}
        ${flight}
        ${s.story && s.story.length ? `<section class="story">${s.story.map((p) => `<p>${html(p)}</p>`).join("")}</section>` : ""}
        ${s.facts && s.facts.length ? `<h2 class="section-title">${isFood ? "Worth knowing" : "Fun facts"}</h2><ol class="facts">${s.facts.map((f) => `<li>${html(f)}</li>`).join("")}</ol>` : ""}
        ${s.lookFor && s.lookFor.length ? `<h2 class="section-title">Look for this</h2><ul class="lookfor">${s.lookFor.map((f) => `<li class="card">${I.eye}${html(f)}</li>`).join("")}</ul>` : ""}
        ${s.practical ? `<h2 class="section-title">Practical</h2><section class="card practical"><dl>${practicalRows(s.practical)}</dl></section>` : ""}
        ${checks}
        ${mapsUrl ? `<a class="maplink" href="${esc(mapsUrl)}" target="_blank" rel="noopener">${I.pin}Open in Google Maps</a>` : ""}
        <nav class="stop-pager" aria-label="Neighbouring stops">
          ${prev ? `<a class="card" href="#/stop/${prev.id}"><span class="sc">‹ No. ${prev.no}</span>${esc(prev.name)}</a>` : ""}
          ${next ? `<a class="card next" href="#/stop/${next.id}"><span class="sc">No. ${next.no} ›</span>${esc(next.name)}</a>` : ""}
        </nav>
        ${s.sources && s.sources.length ? `<p class="sources"><span class="sc">Sources:</span> ${s.sources.map((x) => x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)}</a>` : esc(x.label)).join(" · ")}</p>` : ""}
      </article>`;
  }

  function flightHTML() {
    const f = TRIP.flight || {};
    const v = (x) => x ? esc(x) : `<em class="muted">to fill in</em>`;
    return `<section class="card practical"><h2>Flight details</h2><dl>
      <div class="row"><dt>Airport</dt><dd>${v(f.airport)}</dd></div>
      <div class="row"><dt>Flight</dt><dd>${v(f.flightNumber)}</dd></div>
      <div class="row"><dt>Departs</dt><dd>${v(f.departs)}</dd></div>
      <div class="row"><dt>Be at airport</dt><dd>${v(f.beAtAirport)}</dd></div>
      <div class="row"><dt>Edit</dt><dd>Fill in <code>flight</code> at the top of <code>data/itinerary.js</code>.</dd></div>
    </dl></section>`;
  }

  /* Checklist = every stop with a `book` field + extra items from the data file */
  function checklistItems() {
    const list = [];
    days.forEach((d) => d.stops.forEach((s) => {
      if (s.book) list.push({ id: s.id, day: d, stop: s, title: s.book.what, when: s.book.when, link: s.book.link, priority: s.book.priority || "must" });
    }));
    (TRIP.checklistExtra || []).forEach((x) => list.push(Object.assign({ priority: "must" }, x)));
    return list;
  }

  function viewChecklist() {
    setHeader(null);
    const state = store.get(STORE_CHECK, {});
    const items = checklistItems();
    const groups = [["must", "Must book or buy"], ["recommended", "Recommended (free slots / saves queuing)"], ["optional", "Optional extras"]];
    const done = items.filter((x) => state[x.id]).length;
    const li = (x) => `<li><label class="card">
        <input type="checkbox" data-ck="${esc(x.id)}" ${state[x.id] ? "checked" : ""}>
        <span class="tick">${I.tick}</span>
        <span class="ck-body"><span class="ck-title">${html(x.title)}</span>
          <span class="ck-meta">${x.day ? `Day ${x.day.n} · ${esc(shortDate(x.day.date))} · <a href="#/stop/${x.stop.id}">${esc(x.stop.name)}</a>` : esc(x.context || "")}${x.when ? ` — ${html(x.when)}` : ""}${x.link ? ` · <a href="${esc(x.link)}" target="_blank" rel="noopener">Book</a>` : ""}</span>
        </span></label></li>`;
    return `<div class="wrap">
      <p class="sc muted">Before you fly</p>
      <h1 style="font-size:2rem">Booking checklist</h1>
      <p class="muted">Pulled from your notes. Ticks are saved on this phone only.</p>
      <div class="progress" aria-hidden="true"><span style="width:${items.length ? (done / items.length) * 100 : 0}%"></span></div>
      <p><strong>${done}</strong> of ${items.length} done</p>
      ${groups.map(([g, label]) => {
        const xs = items.filter((x) => x.priority === g);
        return xs.length ? `<h2 class="section-title">${label}</h2><ul class="checklist">${xs.map(li).join("")}</ul>` : "";
      }).join("")}
    </div>`;
  }

  function viewTips() {
    setHeader(null);
    return `<div class="wrap prose">
      <p class="sc muted">Practicalities</p>
      <h1 style="font-size:2rem">Getting about &amp; good to know</h1>
      ${TRIP.tips.map((t) => `<section><h2>${esc(t.title)}</h2>${html(t.html)}${(t.checks || []).map((c) => `<div class="cbyg"><strong>Check before you go</strong>${html(c)}</div>`).join("")}</section>`).join('<hr class="rule">')}
      ${TRIP.tipsSources ? `<p class="sources"><span class="sc">Sources:</span> ${TRIP.tipsSources.map((x) => `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)}</a>`).join(" · ")}</p>` : ""}
    </div>`;
  }

  function viewPlan() {
    setHeader(null);
    const clashes = days.flatMap((d) => (d.alerts || []).map((a) => ({ d, a })))
      .concat(days.flatMap((d) => d.stops.flatMap((s) => (s.alerts || []).map((a) => ({ d, a, s })))));
    const checks = days.flatMap((d) => d.stops.flatMap((s) => (s.checks || []).map((c) => ({ d, s, c }))));
    const tipChecks = TRIP.tips.flatMap((t) => (t.checks || []).map((c) => ({ t, c })));
    return `<div class="wrap prose">
      <p class="sc muted">Plan check</p>
      <h1 style="font-size:2rem">Clashes &amp; things to verify</h1>
      <h2 class="section-title">Timing clashes (${clashes.length})</h2>
      ${clashes.map(({ d, a, s }) => `<section class="alert ${a.level === "minor" ? "minor" : ""}"><h3>${I.warn}<span>Day ${d.n}${s ? ` · ${esc(s.name)}` : ""}: ${esc(a.title)}</span></h3>${html(a.html)}</section>`).join("")}
      <h2 class="section-title">Check before you go (${checks.length + tipChecks.length})</h2>
      <ul>
        ${checks.map(({ d, s, c }) => `<li><a href="#/stop/${s.id}"><strong>Day ${d.n} · ${esc(s.name)}</strong></a>: ${html(c)}</li>`).join("")}
        ${tipChecks.map(({ t, c }) => `<li><a href="#/tips"><strong>${esc(t.title)}</strong></a>: ${html(c)}</li>`).join("")}
      </ul>
    </div>`;
  }

  function viewNotFound() {
    setHeader(null);
    return `<div class="wrap"><h1>Lost in the fog</h1><p>That page doesn't exist. <a href="#/">Back to the start</a>.</p></div>`;
  }

  /* ---------- router ---------- */
  function route() {
    const h = location.hash.replace(/^#\/?/, "");
    const [a, b] = h.split("/");
    let out, nav = "today";
    if (!a) { out = viewHome(); nav = "today"; }
    else if (a === "day") { out = viewDay(Number(b), dayForDate(todayISO())?.n === Number(b)); nav = "days"; }
    else if (a === "stop") { out = viewStop(decodeURIComponent(b || "")); nav = "days"; }
    else if (a === "book") { out = viewChecklist(); nav = "book"; }
    else if (a === "tips") { out = viewTips(); nav = "tips"; }
    else if (a === "plan") { out = viewPlan(); nav = "book"; }
    else if (a === "days") { out = viewDaysList(); nav = "days"; }
    else out = viewNotFound();
    $app.innerHTML = `<main id="main" tabindex="-1">${out}<footer class="colophon">${esc(TRIP.title)} · <a href="#/plan">Plan check</a> · <a href="#/tips">Tips</a></footer></main>`;
    setNav(nav);
    window.scrollTo(0, 0);
  }

  function viewDaysList() {
    const t = dayForDate(todayISO());
    return t ? viewDay(t.n, true) : viewHome();
  }

  /* checklist ticks */
  $app.addEventListener("change", (e) => {
    const id = e.target && e.target.dataset && e.target.dataset.ck;
    if (!id) return;
    const st = store.get(STORE_CHECK, {});
    if (e.target.checked) st[id] = Date.now(); else delete st[id];
    store.set(STORE_CHECK, st);
    const items = checklistItems();
    const done = items.filter((x) => st[x.id]).length;
    const bar = $app.querySelector(".progress span"); if (bar) bar.style.width = (done / items.length) * 100 + "%";
    const p = bar && bar.parentElement.nextElementSibling; if (p) p.innerHTML = `<strong>${done}</strong> of ${items.length} done`;
    setNav("book");
  });

  /* swipe between days */
  let sx = null, sy = null;
  $app.addEventListener("touchstart", (e) => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
  $app.addEventListener("touchend", (e) => {
    if (sx == null) return;
    const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    sx = sy = null;
    const el = $app.querySelector("[data-swipe-day]");
    if (!el || Math.abs(dx) < 70 || Math.abs(dy) > 50) return;
    const n = Number(el.dataset.swipeDay) + (dx < 0 ? 1 : -1);
    if (n >= 1 && n <= days.length) location.hash = `#/day/${n}`;
  }, { passive: true });

  /* theme */
  function applyTheme(t) {
    if (t) document.documentElement.setAttribute("data-theme", t); else document.documentElement.removeAttribute("data-theme");
    const dark = t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    const btn = document.getElementById("theme-btn");
    btn.innerHTML = dark ? I.sun : I.moon;
    btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark (evening) mode");
    document.querySelector('meta[name="theme-color"]').setAttribute("content", dark ? "#12161e" : "#f4ecdc");
  }
  document.getElementById("theme-btn").addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = cur === "dark" ? "light" : "dark";
    store.set(STORE_THEME, next);
    applyTheme(next);
  });
  applyTheme(store.get(STORE_THEME, null));

  /* static icons in shell */
  document.querySelector(".crest").innerHTML = I.crest;
  document.querySelectorAll("[data-icon]").forEach((el) => { el.innerHTML = I[el.dataset.icon]; });

  /* online / offline */
  const setOnline = () => document.body.classList.toggle("is-offline", !navigator.onLine);
  addEventListener("online", setOnline); addEventListener("offline", setOnline); setOnline();

  addEventListener("hashchange", route);
  route();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
