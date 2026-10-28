/* London, December 2026 — app shell.
   Reads window.TRIP (data/itinerary.js) and renders hash routes:
     #/            home (opens today's day during the trip, else a day picker)
     #/day/N       day timeline
     #/stop/ID     stop detail
     #/book        booking checklist
     #/tips        transport & general tips
     #/plan        timing clashes + every "Check before you go" item
   Photos: each stop's `wiki` title(s) → Wikipedia lead image, fetched once and cached for offline.
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
    const line = day.line || { name: `Day ${n}`, colour: "#14215b" };
    return Object.assign({}, day, { n, date, sun, items, line, stops: items.filter((x) => x.no) });
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
    crest: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#14215b"/><path d="M32 13 46 34H38L50 48H14L26 34H18Z" fill="none" stroke="#2fa84f" stroke-width="5" stroke-linejoin="miter" stroke-miterlimit="4"/><path d="M32 48v7" stroke="#2fa84f" stroke-width="5"/><g fill="#fff" stroke="#dc241f" stroke-width="2.6"><circle cx="26" cy="34" r="3.6"/><circle cx="38" cy="34" r="3.6"/><circle cx="14" cy="48" r="3.6"/><circle cx="50" cy="48" r="3.6"/></g><path d="m32 4 2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7-3.4-3.3 4.7-.7Z" fill="#ffc80a"/></svg>`,
    moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>`,
    sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`,
    today: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><circle cx="12" cy="15" r="2" fill="currentColor"/></svg>`,
    days: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10"/></svg>`,
    book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 12 3 3 5-6"/></svg>`,
    tips: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>`,
    snow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 2 3-2M9 20l3-2 3 2"/></svg>`,
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

  I.arrow = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
  I.arrowUp = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>`;
  I.info = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M12 10.5v7M12 6.6v.2" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>`;
  I.ticket = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4Z"/><path d="M14 7v10" stroke-dasharray="2 2"/></svg>`;

  /* ---------- photos (Wikipedia lead images, cached for offline) ---------- */
  const PHOTO_STORE = "ldn26.photos.v1";
  let photos = store.get(PHOTO_STORE, {});
  const wikiOf = (s) => [].concat(s.wiki || []);
  function photoFor(s) {
    for (const t of wikiOf(s)) { const p = photos[t]; if (p && p.src) return p; }
    return null;
  }
  const photoAttr = (p) => `https://en.wikipedia.org/wiki/File:${encodeURIComponent((p.file || "").replace(/ /g, "_"))}`;
  // A photo frame; falls back to a tiled "platform wall" panel when there's no image (offline before first sync).
  function photoHTML(s, cls, line) {
    const p = photoFor(s);
    return `<div class="ph ${cls || ""} ${p ? "" : "ph-empty"}" style="--line:${line || "var(--brand)"}">
      ${p ? `<img src="${esc(p.src)}" alt="Photo: ${esc(s.name)}" loading="lazy" decoding="async" onerror="this.parentNode.classList.add('ph-empty');this.remove()">` : ""}
      <span class="ph-fallback" aria-hidden="true">${I.crest}</span>
    </div>`;
  }
  async function fetchPhotos() {
    if (!navigator.onLine || !window.fetch) return;
    const all = [...new Set(days.flatMap((d) => d.stops.flatMap(wikiOf)))];
    const want = all.filter((t) => !(t in photos));
    let changed = false;
    for (let i = 0; i < want.length; i += 40) {
      const chunk = want.slice(i, i + 40);
      const url = "https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&origin=*&redirects=1" +
        "&prop=pageimages&piprop=thumbnail%7Cname&pithumbsize=960&titles=" + encodeURIComponent(chunk.join("|"));
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const q = (await res.json()).query || {};
        const hop = {};
        (q.normalized || []).concat(q.redirects || []).forEach((r) => { hop[r.from] = r.to; });
        const pages = {};
        (q.pages || []).forEach((pg) => { pages[pg.title] = pg; });
        chunk.forEach((t) => {
          let k = t, guard = 0;
          while (hop[k] && guard++ < 4) k = hop[k];
          const pg = pages[k];
          photos[t] = pg && pg.thumbnail ? { src: pg.thumbnail.source, file: pg.pageimage, page: pg.title } : { src: null };
          changed = true;
        });
      } catch (e) { /* offline or blocked: keep placeholders */ }
    }
    if (changed) { store.set(PHOTO_STORE, photos); route(true); }
    // Warm the service-worker cache so every photo works on the Tube.
    Object.values(photos).forEach((p) => { if (p && p.src) { const im = new Image(); im.src = p.src; } });
  }

  /* ---------- shell ---------- */
  function setHeader(day) {
    const now = document.getElementById("hdr-now");
    const kicker = document.getElementById("hdr-kicker");
    kicker.textContent = day ? day.line.name : TRIP.subtitle;
    now.textContent = day ? `Day ${day.n} · ${shortDate(day.date)}` : TRIP.brand;
    const tabs = document.getElementById("daytabs");
    const t = todayISO();
    tabs.innerHTML = days.map((d) => `
      <a class="daytab" style="--line:${d.line.colour}" href="#/day/${d.n}" ${day && day.n === d.n ? 'aria-current="page"' : ""} aria-label="Day ${d.n}, ${esc(longDate(d.date))}, ${esc(d.line.name)}">
        <span class="dow">${esc(fmtDate(d.date, { weekday: "short" }))}</span><b>${esc(fmtDate(d.date, { day: "numeric" }))}</b>
        ${d.date === t ? '<i class="today-dot" aria-label="today"></i>' : ""}
      </a>`).join("");
  }

  function setNav(route) {
    document.querySelectorAll(".bottomnav a").forEach((a) => {
      if (a.dataset.route === route) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    const open = checklistItems().filter((c) => !c.booked && !store.get(STORE_CHECK, {})[c.id]).length;
    const cnt = document.getElementById("book-count");
    cnt.textContent = open ? String(open) : "";
    cnt.hidden = !open;
  }

  /* ---------- small parts ---------- */
  const nowMin = () => { const p = fmtClock(new Date()).split(":").map(Number); return p[0] * 60 + p[1]; };
  const shortName = (s) => s.name.replace(/^(Breakfast|Lunch|Coffee|Walk)[^:]*:\s*/i, "").replace(/\s*\(.*\)$/, "");

  function badgesFor(stop, day) {
    const b = [];
    if (stop.booked) b.push(`<span class="badge booked">${I.ticket}Booked</span>`);
    else if (stop.book) b.push(`<span class="badge book">Book ahead</span>`);
    if (stop.free) b.push(`<span class="badge free">Free entry</span>`);
    const dl = daylight(stop, day);
    if (dl === "before") b.push(`<span class="badge daylight">${I.sunset}Best before dark</span>`);
    if (dl === "tight") b.push(`<span class="badge check">${I.sunset}Close to sunset ${fmtClock(day.sun.sunset)}</span>`);
    if (dl === "after") b.push(`<span class="badge check">${I.sunset}After sunset</span>`);
    if (stop.light === "night") b.push(`<span class="badge dark">${I.moon}Best after dark</span>`);
    if (stop.checks && stop.checks.length) b.push(`<span class="badge check">${I.warn}Check before you go</span>`);
    return b.length ? `<div class="badges">${b.join("")}</div>` : "";
  }

  // Just the two badges that matter at a glance on a timeline card
  function cardBadges(stop) {
    const b = [];
    if (stop.booked) b.push(`<span class="badge booked">${I.ticket}Booked</span>`);
    else if (stop.book) b.push(`<span class="badge book">Book ahead</span>`);
    if (stop.checks && stop.checks.length) b.push(`<span class="badge check">${I.warn}Check first</span>`);
    return b.length ? `<div class="badges">${b.join("")}</div>` : "";
  }

  // Departure-board status column
  function boardStatus(s, day) {
    if (s.booked) return ["Booked", "ok"];
    if (s.suggestedTime && s.suggestedTime !== s.time) return [`Try ${s.suggestedTime}`, "warn"];
    const dl = daylight(s, day);
    if (dl === "tight" || dl === "after") return ["Dusk", "warn"];
    if ((s.alerts || []).length) return ["Delayed", "warn"];
    if (s.book) return ["Book", "warn"];
    return ["On time", ""];
  }

  // Line status whiteboard (alerts)
  function statusBoard(alerts, line, title) {
    if (!alerts || !alerts.length) return "";
    return `<section class="statusboard" aria-label="Line status">
      <header class="sb-head"><span>${esc(title || "Line status")}</span><span class="sb-sub">Tap for details</span></header>
      ${alerts.map(({ a, label, colour }) => `
        <details class="sb-row ${a.level === "minor" ? "minor" : ""}">
          <summary><span class="sb-line" style="--line:${colour || line.colour}">${esc(label || line.name)}</span>
            <span class="sb-status"><b>${a.level === "minor" ? "Minor delays" : "Severe delays"}</b><span>${esc(a.title)}</span></span>
            <i class="chev" aria-hidden="true"></i></summary>
          <div class="sb-body">${html(a.html)}</div>
        </details>`).join("")}
    </section>`;
  }

  function mindTheGap(checks) {
    return (checks || []).map((c) => `<div class="mtg"><strong>${I.warn}Check before you go</strong>${html(c)}</div>`).join("");
  }

  function timeLabel(it) {
    if (!it.time) return it.when ? `<small>${esc(it.when)}</small>` : "";
    return `${esc(it.time)}${it.endTime ? `<small>–${esc(it.endTime)}</small>` : ""}`;
  }

  function clockHTML() { return `<span class="db-clock" data-clock>${fmtClock(new Date())}</span>`; }

  /* ---------- views ---------- */
  function viewHome() {
    const t = todayISO();
    const today = dayForDate(t);
    if (today) return viewDay(today.n, true);
    setHeader(null);
    const first = days[0].date, last = days[days.length - 1].date;
    const utc = (iso) => { const { y, m, d } = parseISO(iso); return Date.UTC(y, m - 1, d); };
    const diff = Math.round((utc(first) - utc(t)) / 86400000);
    let count = "";
    if (t < first) count = diff === 1 ? "1 sleep to departure" : `${diff} sleeps to departure`;
    else if (t > last) count = "All services have now arrived";
    const status = (d) => d.date < t ? "Arrived" : "On time";
    const next = days.find((d) => d.date >= t) || days[0];
    const openChecks = checklistItems().filter((c) => !c.booked && !store.get(STORE_CHECK, {})[c.id]).length;
    const clashes = days.reduce((n, d) => n + (d.alerts || []).filter((a) => a.level !== "minor").length, 0);
    return `
      <div class="wrap">
        <section class="nameboard" aria-label="${esc(TRIP.brand)}">
          <span class="nb-logo">${I.crest}</span>
          <span class="nb-text"><b>${esc(TRIP.brand)}</b><small>${esc(TRIP.subtitle)} · ${esc(TRIP.dates)}</small></span>
        </section>

        <section class="board home-board" aria-label="Departures">
          <header class="db-head"><span>Departures</span>${clockHTML()}</header>
          ${days.map((d) => `<a class="db-row" href="#/day/${d.n}">
            <span class="db-time">${esc(fmtDate(d.date, { weekday: "short", day: "numeric" }))}</span>
            <span class="db-dest">${esc(d.title)}<small><i class="db-dot" style="--line:${d.line.colour}"></i>${esc(d.line.name)} · ${d.stops.length} stops</small></span>
            <span class="db-stat">${status(d)}</span></a>`).join("")}
          <div class="db-ticker" aria-label="Calling at"><span>Day ${next.n} calling at: ${next.stops.map((s) => esc(shortName(s))).join(", ")}.</span></div>
          ${count ? `<footer class="db-foot">${I.snow}<span>${esc(count)}</span></footer>` : ""}
        </section>

        ${tripMap()}

        <h2 class="sign-title">Day by day</h2>
        <ul class="daylist">
          ${days.map((d) => {
            const cover = d.stops.find((s) => s.type === "sight" && photoFor(s)) || d.stops.find((s) => s.type === "sight") || d.stops[0];
            return `<li><a class="daycard" style="--line:${d.line.colour}" href="#/day/${d.n}">
              ${photoHTML(cover, "ph-day", d.line.colour)}
              <span class="dc-body">
                <span class="dc-line"><span class="dc-bullet" aria-hidden="true"></span>${esc(d.line.name)} · ${esc(fmtDate(d.date, { weekday: "short", day: "numeric", month: "short" }))}</span>
                <span class="dc-title">${esc(d.title)}</span>
                <span class="dc-meta">${d.stops.length} stops</span>
              </span></a></li>`;
          }).join("")}
        </ul>

        <nav class="wayouts" aria-label="More">
          <a class="wayout" href="#/book"><span>${I.arrow}</span><b>Tickets &amp; bookings</b><small>${openChecks ? `${openChecks} still to book` : "All done"}</small></a>
          <a class="wayout" href="#/plan"><span>${I.arrow}</span><b>Line status</b><small>${clashes} disruptions to plan around</small></a>
          <a class="wayout" href="#/tips"><span>${I.arrow}</span><b>Travel information</b><small>Fares, caps &amp; getting about</small></a>
        </nav>
        <p class="intro small">Staying near ${esc(TRIP.base.name)}. ${esc(TRIP.base.note || "")}</p>
      </div>`;
  }

  /* The whole trip as one line with five stations, each segment in that day's colour */
  function tripMap(current) {
    const t = todayISO();
    return `<nav class="tripmap" aria-label="Trip map">
      ${days.map((d) => `<a class="tm-stop ${current === d.n ? "is-current" : ""} ${d.date === t ? "is-today" : ""}" style="--line:${d.line.colour}" href="#/day/${d.n}">
        <span class="tm-seg" aria-hidden="true"></span><span class="tm-dot" aria-hidden="true"></span>
        <span class="tm-label"><b>${esc(fmtDate(d.date, { weekday: "short", day: "numeric" }))}</b><small>${esc(d.line.name.replace(/ line$/, ""))}</small></span>
      </a>`).join("")}
    </nav>`;
  }

  function viewDay(n, isToday) {
    const day = days[n - 1];
    if (!day) return viewNotFound();
    setHeader(day);
    const ss = fmtClock(day.sun.sunset), sr = fmtClock(day.sun.sunrise);
    let nowIdx = -1;
    if (isToday) { const nm = nowMin(); day.stops.forEach((s, i) => { const t = toMin(s.suggestedTime || s.time); if (t != null && t <= nm) nowIdx = i; }); }
    const cover = day.stops.find((s) => s.type === "sight" && photoFor(s)) || day.stops.find((s) => s.type === "sight");
    const rows = day.items.map((it) => {
      if (it.type === "travel") {
        return `<li class="tl-leg"><span class="leg-icon">${modeIcon(it.mode)}</span>
          <details class="leg-text"><summary><span class="leg-change">${it.time ? `${esc(it.time)} · ` : ""}${esc(it.modeLabel || it.mode)}</span><span class="leg-route">${esc(it.from)} → ${esc(it.to)}</span>${it.detail ? `<span class="leg-more">How to get there</span>` : ""}</summary>${it.detail ? `<p class="leg-detail">${html(it.detail)}</p>` : ""}</details></li>`;
      }
      const notes = (it.myNotes || []).length ? `<p class="mynote">${I.note}<span>${it.myNotes.map(html).join(" · ")}</span></p>` : "";
      return `<li class="tl-item ${it.type}">
        <div class="tl-marker" aria-hidden="true"></div>
        <a class="tl-card" href="#/stop/${it.id}">
          <span class="tl-media">${photoHTML(it, "ph-thumb", day.line.colour)}<span class="tl-time">${timeLabel(it)}</span></span>
          <span class="tl-body">
            <h3><span class="visually-hidden">Stop ${it.no}: </span>${esc(it.name)}</h3>
            <p class="teaser">${html(it.teaser)}</p>
            ${notes}
            ${it.suggestedTime && it.suggestedTime !== it.time ? `<p class="suggested">Better at ${esc(it.suggestedTime)}${it.suggestedEnd ? "–" + esc(it.suggestedEnd) : ""}</p>` : ""}
            ${cardBadges(it)}
          </span>
        </a></li>`;
    }).join("");

    const prev = days[n - 2], next = days[n];
    return `
      <div class="wrap" data-swipe-day="${n}" style="--line:${day.line.colour}">
        <header class="platform">
          ${cover ? photoHTML(cover, "ph-hero", day.line.colour) : ""}
          <div class="platform-sign">
            <p class="ps-meta"><span class="ps-line">${esc(day.line.name)}</span>${isToday ? `<span class="ps-today">Today</span>` : ""}</p>
            <h1>${esc(day.title)}</h1>
            <p class="ps-date">Day ${day.n} · ${esc(longDate(day.date))}</p>
          </div>
        </header>

        <div class="glance" role="list">
          <span role="listitem">${I.sun}<b>${sr}–${ss}</b><small>daylight</small></span>
          <span role="listitem">${I.pin}<b>${day.stops.length}</b><small>stops</small></span>
          <span role="listitem" class="${(day.alerts || []).some((a) => a.level !== "minor") ? "hot" : ""}">${I.warn}<b>${(day.alerts || []).length}</b><small>alerts</small></span>
        </div>

        <p class="nutshell">${html(day.nutshell)}</p>

        ${statusBoard((day.alerts || []).map((a) => ({ a })), day.line, "Line status")}

        <section class="board" aria-label="Day ${day.n} departures">
          <header class="db-head"><span>Departures</span>${clockHTML()}</header>
          ${day.stops.map((s, i) => { const [st, cls] = boardStatus(s, day); return `<a class="db-row ${i === nowIdx ? "now" : ""}" href="#/stop/${s.id}">
            <span class="db-time">${esc(s.time || s.suggestedTime || "Eve")}</span><span class="db-dest">${esc(shortName(s))}${i === nowIdx ? `<small>You are here</small>` : ""}</span><span class="db-stat ${cls}">${st}</span></a>`; }).join("")}
          <footer class="db-foot"><span>Sunrise ${sr}</span><span>Sunset ${ss}</span></footer>
        </section>

        <p class="areas"><b>Areas:</b> ${day.neighbourhoods.map(esc).join(", ")}</p>

        <h2 class="sign-title">Calling at</h2>
        <ol class="timeline">${rows}</ol>

        <nav class="nexttrain" aria-label="Other days">
          ${prev ? `<a class="nt prev" href="#/day/${prev.n}" style="--line:${prev.line.colour}"><span class="nt-label">${I.left}Previous · Day ${prev.n}</span><b>${esc(prev.line.name)}</b></a>` : "<span></span>"}
          ${next ? `<a class="nt next" href="#/day/${next.n}" style="--line:${next.line.colour}"><span class="nt-label">Next · Day ${next.n}${I.arrow}</span><b>${esc(next.line.name)}</b></a>` : ""}
        </nav>
        <p class="hint">Swipe left or right to change day</p>
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
    const p = photoFor(s);

    const suggested = s.suggestedTime ? `<p><strong>Suggested timing:</strong> ${esc(s.suggestedTime)}${s.suggestedEnd ? "–" + esc(s.suggestedEnd) : ""}${s.suggestedWhy ? ` — ${html(s.suggestedWhy)}` : ""}</p>` : "";
    const notes = (s.myNotes && s.myNotes.length) || suggested ? `
      <aside class="note-to-self"><span class="label">${I.note}Note to self</span>
        ${(s.myNotes || []).map((x) => `<p>${html(x)}</p>`).join("")}${suggested}
      </aside>` : "";

    const ticket = s.booked ? `
      <aside class="ticket" aria-label="Booked">
        <div class="tk-top"><span>Booked</span><span>${esc(day.line.name)}</span></div>
        <div class="tk-main"><b>${esc(shortName(s))}</b><p>${html(s.booked.summary)}</p>${s.booked.note ? `<p class="tk-note">${html(s.booked.note)}</p>` : ""}</div>
        <div class="tk-foot"><span>Valid ${esc(fmtDate(day.date, { day: "2-digit", month: "short", year: "numeric" }))}</span><span>Adult/Student</span></div>
      </aside>` : "";

    const food = isFood && s.food ? `
      <section class="infoboard food" aria-label="Menu">
        <header class="ib-head">${I.info}<span>On the menu</span></header>
        <dl>
          <div class="row"><dt>Known for</dt><dd>${html(s.food.knownFor)}</dd></div>
          <div class="row"><dt>What to order</dt><dd>${html(s.food.order)}</dd></div>
          <div class="row"><dt>Price</dt><dd>${html(s.food.price)}</dd></div>
          ${s.food.alternatives ? `<div class="row"><dt>Or try</dt><dd>${html(s.food.alternatives)}</dd></div>` : ""}
        </dl>
      </section>` : "";

    return `
      <article class="wrap" style="--line:${day.line.colour}">
        <a class="backlink" href="#/day/${day.n}">${I.left}${esc(day.line.name)} · Day ${day.n}</a>
        <header class="stop-head">
          ${photoHTML(s, "ph-hero", day.line.colour)}
          <div class="namebar">
            <h1>${esc(s.name)}</h1>
          </div>
          <div class="stop-card">
            <p class="stop-meta"><span class="stopno">${s.no}</span><span>${esc(timeStr)}</span>${s.area ? `<span class="dot">·</span><span>${esc(s.area)}</span>` : ""}</p>
            ${badgesFor(s, day)}
            ${p && p.file ? `<p class="credit">Photo: <a href="${photoAttr(p)}" target="_blank" rel="noopener">Wikimedia Commons</a></p>` : ""}
          </div>
        </header>
        ${statusBoard((s.alerts || []).map((a) => ({ a })), day.line, "Service update")}
        ${ticket}
        ${notes}
        ${food}
        ${s.type === "flight" ? flightHTML() : ""}
        ${s.practical ? `<section class="infoboard" aria-label="Essentials"><header class="ib-head">${I.info}<span>Essentials</span></header><dl>${practicalRows(s.practical)}</dl></section>` : ""}
        ${mapsUrl ? `<a class="wayout" href="${esc(mapsUrl)}" target="_blank" rel="noopener"><span>${I.arrowUp}</span><b>Way out</b><small>Open in Google Maps</small></a>` : ""}
        ${mindTheGap(s.checks)}
        ${s.story && s.story.length ? `<h2 class="sign-title">The story</h2><section class="story">${s.story.map((x) => `<p>${html(x)}</p>`).join("")}</section>` : ""}
        ${s.lookFor && s.lookFor.length ? `<h2 class="sign-title">Look out for</h2><ul class="lookfor">${s.lookFor.map((f) => `<li>${I.eye}<span>${html(f)}</span></li>`).join("")}</ul>` : ""}
        ${s.facts && s.facts.length ? `<h2 class="sign-title">${isFood ? "Worth knowing" : "Did you know?"}</h2><ol class="facts">${s.facts.map((f) => `<li>${html(f)}</li>`).join("")}</ol>` : ""}
        <nav class="nexttrain" aria-label="Neighbouring stops">
          ${prev ? `<a class="nt prev" href="#/stop/${prev.id}"><span class="nt-label">${I.left}Previous stop</span><b>${esc(shortName(prev))}</b></a>` : "<span></span>"}
          ${next ? `<a class="nt next" href="#/stop/${next.id}"><span class="nt-label">Next stop${I.arrow}</span><b>${esc(shortName(next))}</b></a>` : ""}
        </nav>
        ${s.sources && s.sources.length ? `<p class="sources"><span class="label">Sources</span> ${s.sources.map((x) => x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)}</a>` : esc(x.label)).join(" · ")}</p>` : ""}
      </article>`;
  }

  function flightHTML() {
    const f = TRIP.flight || {};
    const v = (x) => x ? esc(x) : `<em class="muted">to fill in</em>`;
    return `<section class="board flightboard" aria-label="Flight">
      <header class="db-head"><span>Flight departures</span>${clockHTML()}</header>
      <div class="db-row static"><span class="db-time">${esc((f.departs || "").split(", ").pop() || "--:--")}</span><span class="db-dest">Suceava · ${esc((f.flightNumber || "").split(" (")[0])}</span><span class="db-stat ok">On time</span></div>
      <footer class="db-foot"><span>${v(f.airport)}</span></footer>
    </section>
    <section class="infoboard"><header class="ib-head">${I.plane}<span>Flight details</span></header><dl>
      <div class="row"><dt>Airport</dt><dd>${v(f.airport)}</dd></div>
      <div class="row"><dt>Flight</dt><dd>${v(f.flightNumber)}</dd></div>
      <div class="row"><dt>Departs</dt><dd>${v(f.departs)}</dd></div>
      <div class="row"><dt>Be at airport</dt><dd>${v(f.beAtAirport)}</dd></div>
      ${f.baggage ? `<div class="row"><dt>Baggage</dt><dd>${esc(f.baggage)}</dd></div>` : ""}
      ${f.outbound ? `<div class="row"><dt>Outbound</dt><dd>${esc(f.outbound)}</dd></div>` : ""}
    </dl></section>`;
  }

  /* Checklist = every stop with a `book`/`booked` field + extra items from the data file */
  function checklistItems() {
    const list = [];
    days.forEach((d) => d.stops.forEach((s) => {
      if (s.booked) list.push({ id: s.id, day: d, stop: s, title: s.name, when: s.booked.summary, priority: "booked", booked: true });
      else if (s.book) list.push({ id: s.id, day: d, stop: s, title: s.book.what, when: s.book.when, link: s.book.link, priority: s.book.priority || "must" });
    }));
    (TRIP.checklistExtra || []).forEach((x) => list.push(Object.assign({ priority: "must" }, x)));
    return list;
  }

  function viewChecklist() {
    setHeader(null);
    const state = store.get(STORE_CHECK, {});
    const items = checklistItems();
    const groups = [["must", "Must book or buy"], ["recommended", "Recommended"], ["optional", "Optional extras"]];
    const isDone = (x) => x.booked || state[x.id];
    const done = items.filter(isDone).length;
    const booked = items.filter((x) => x.booked);
    const li = (x) => `<li><label class="ck">
        <input type="checkbox" data-ck="${esc(x.id)}" ${isDone(x) ? "checked" : ""}>
        <span class="tick">${I.tick}</span>
        <span class="ck-body"><span class="ck-title">${html(x.title)}</span>
          <span class="ck-meta">${x.day ? `Day ${x.day.n} · ${esc(shortDate(x.day.date))} · <a href="#/stop/${x.stop.id}">${esc(x.stop.name)}</a>` : esc(x.context || "")}${x.when ? ` — ${html(x.when)}` : ""}${x.link ? ` · <a href="${esc(x.link)}" target="_blank" rel="noopener">Book</a>` : ""}</span>
        </span></label></li>`;
    return `<div class="wrap">
      <header class="pagesign"><span class="ps-icon">${I.ticket}</span><h1>Tickets &amp; bookings</h1></header>
      <p class="intro">Pulled from your notes. Ticks are saved on this phone only.</p>
      <div class="progress" aria-hidden="true"><span style="width:${items.length ? (done / items.length) * 100 : 0}%"></span></div>
      <p><strong>${done}</strong> of ${items.length} done</p>
      <h2 class="sign-title">In your wallet</h2>
      <div class="ticketstack">${booked.map((x) => `<a class="ticket mini" href="#/stop/${x.stop.id}" style="--line:${x.day.line.colour}">
        <div class="tk-top"><span>Booked</span><span>Day ${x.day.n} · ${esc(shortDate(x.day.date))}</span></div>
        <div class="tk-main"><b>${esc(x.stop.name)}</b><p>${html(x.when)}</p></div></a>`).join("")}</div>
      ${groups.map(([g, label]) => {
        const xs = items.filter((x) => !x.booked && x.priority === g);
        return xs.length ? `<h2 class="sign-title">${label}</h2><ul class="checklist">${xs.map(li).join("")}</ul>` : "";
      }).join("")}
    </div>`;
  }

  function viewTips() {
    setHeader(null);
    return `<div class="wrap prose">
      <header class="pagesign"><span class="ps-icon">${I.info}</span><h1>Travel information</h1></header>
      ${TRIP.tips.map((t) => `<section class="infoboard tip"><header class="ib-head"><span>${esc(t.title)}</span></header><div class="ib-body">${html(t.html)}</div></section>${mindTheGap(t.checks)}`).join("")}
      ${TRIP.tipsSources ? `<p class="sources"><span class="label">Sources</span> ${TRIP.tipsSources.map((x) => `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)}</a>`).join(" · ")}</p>` : ""}
    </div>`;
  }

  function viewPlan() {
    setHeader(null);
    const clashes = days.flatMap((d) => (d.alerts || []).map((a) => ({ a, label: `Day ${d.n}`, colour: d.line.colour })))
      .concat(days.flatMap((d) => d.stops.flatMap((s) => (s.alerts || []).map((a) => ({ a, label: `Day ${d.n}`, colour: d.line.colour })))));
    const checks = days.flatMap((d) => d.stops.flatMap((s) => (s.checks || []).map((c) => ({ d, s, c }))));
    const tipChecks = TRIP.tips.flatMap((t) => (t.checks || []).map((c) => ({ t, c })));
    return `<div class="wrap prose">
      <header class="pagesign"><span class="ps-icon">${I.warn}</span><h1>Line status</h1></header>
      <p class="intro">Every timing clash and every "check before you go" item, in one place.</p>
      ${statusBoard(clashes, days[0].line, `Disruptions (${clashes.length})`)}
      <h2 class="sign-title">Check before you go (${checks.length + tipChecks.length})</h2>
      <ul class="checks">
        ${checks.map(({ d, s, c }) => `<li style="--line:${d.line.colour}"><a href="#/stop/${s.id}"><strong>Day ${d.n} · ${esc(s.name)}</strong></a> ${html(c)}</li>`).join("")}
        ${tipChecks.map(({ t, c }) => `<li><a href="#/tips"><strong>${esc(t.title)}</strong></a> ${html(c)}</li>`).join("")}
      </ul>
    </div>`;
  }

  function viewNotFound() {
    setHeader(null);
    return `<div class="wrap"><header class="pagesign"><h1>No service</h1></header><p>That page doesn't exist. <a href="#/">Back to the concourse</a>.</p></div>`;
  }

  /* ---------- router ---------- */
  function route(keepScroll) {
    const y = window.scrollY;
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
    $app.innerHTML = `<main id="main" tabindex="-1">${out}<footer class="colophon">${esc(TRIP.brand)} · ${esc(TRIP.subtitle)} · <a href="#/plan">Line status</a> · <a href="#/tips">Travel info</a></footer></main>`;
    setNav(nav);
    window.scrollTo(0, keepScroll === true ? y : 0);
  }

  function viewDaysList() {
    const t = dayForDate(todayISO());
    return viewDay(t ? t.n : 1, !!t);
  }

  /* checklist ticks */
  $app.addEventListener("change", (e) => {
    const id = e.target && e.target.dataset && e.target.dataset.ck;
    if (!id) return;
    const st = store.get(STORE_CHECK, {});
    if (e.target.checked) st[id] = Date.now(); else delete st[id];
    store.set(STORE_CHECK, st);
    const items = checklistItems();
    const done = items.filter((x) => x.booked || st[x.id]).length;
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
    if (e.target.closest && e.target.closest(".stripmap")) return; // the strip map scrolls sideways
    const el = $app.querySelector("[data-swipe-day]");
    if (!el || Math.abs(dx) < 70 || Math.abs(dy) > 50) return;
    const n = Number(el.dataset.swipeDay) + (dx < 0 ? 1 : -1);
    if (n >= 1 && n <= days.length) location.hash = `#/day/${n}`;
  }, { passive: true });

  /* live clocks on the departure boards */
  setInterval(() => { const c = fmtClock(new Date()); document.querySelectorAll("[data-clock]").forEach((el) => { el.textContent = c; }); }, 20000);

  /* theme */
  function applyTheme(t) {
    if (t) document.documentElement.setAttribute("data-theme", t); else document.documentElement.removeAttribute("data-theme");
    const dark = t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    const btn = document.getElementById("theme-btn");
    btn.innerHTML = dark ? I.sun : I.moon;
    btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark (evening) mode");
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
  addEventListener("online", () => { setOnline(); fetchPhotos(); }); addEventListener("offline", setOnline); setOnline();

  addEventListener("hashchange", () => route());
  route();
  fetchPhotos();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
