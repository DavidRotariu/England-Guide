# London ’26: a pocket guide

A phone-first, offline-capable web app for a five-day London trip (Fri 4 – Tue 8 December 2026). It shows a day-by-day timeline, and each stop opens a story-led guide: history, fun facts, things to look for, practical details, sources, and your own notes.

| Home | Day | Stop page | Dark mode |
|---|---|---|---|
| ![](docs/screenshots/home.png) | ![](docs/screenshots/day.png) | ![](docs/screenshots/stop.png) | ![](docs/screenshots/dark.png) |

<sub>The screenshots use stand-in skyline images. On a phone the app shows real photos of each place.</sub>

## What's in it

- **Today**: during the trip it opens on today's day. Before or after the trip it shows a day picker with a countdown. Each day has a "nutshell" intro, its neighbourhoods, sunrise and sunset (calculated on the device), and a "best before dark" list that flags stops scheduled too close to sunset.
- **Timeline**: numbered stops with times, teasers and your notes, plus travel legs between them. Swipe left or right or use the day tabs to change day. The sticky header shows *Day X · date*.
- **Stop pages**: story, fun facts, "Look for this", a practical box, *Check before you go* tags, a Google Maps link, a "Note to self" box and sources. Food stops get a lighter card.
- **Book**: a booking checklist built from every stop with a `book` field. Ticks are saved in `localStorage` on the phone.
- **Plan check** (`#/plan`): every timing clash and every *Check before you go* item in one list.
- **Tips**: contactless/Oyster caps, getting in from Mill Hill, December practicalities.
- **PWA**: installable, and works fully offline (service worker precaches pages, data, fonts and icons).

No build step and no dependencies: plain HTML, CSS and JS.

**Design: "The Christmas Line", a London Underground station in your pocket.**

| In the station | In the app |
|---|---|
| Glazed tiled platform walls | Page background |
| Blue station signage | Header, stop name boards, section signs, bottom bar |
| Strip map above the train doors | Each day's stops as a horizontal line diagram, with "You are here" during the trip |
| Dot-matrix departure board | Home (your 5 days as departures, with a live clock and "calling at" ticker) and each day's schedule |
| Line status whiteboard | Timing clashes ("Severe delays" / "Minor delays"), tap to expand |
| Yellow "Way out" signs | Google Maps and onward links |
| "Mind the gap" | "Check before you go" warnings |
| Station information panel | Hours, prices, nearest station |
| Orange-banded rail ticket | Your bookings ("In your wallet") |
| Next-train indicators | Previous/next stop and day |

Each day is its own coloured line (Royal, Museum, River, Dickens, Meridian; set in `data/itinerary.js` → `line`). Christmas touches: a garland stripe, light snow in the header, a tree-shaped line-map logo and a "sleeps to departure" countdown.

**Typeface:** the signs use **Railway Sans**, an OFL-licensed revival of the 1916 Johnston lettering, if you add it. Download `RailwaySans-Regular.otf` from Font Library or Font Squirrel, put it in `/fonts`, and it takes over automatically. Until then the signs use Jost. Reading text is Inter and the boards use VT323. All fonts are SIL OFL and self-hosted. The TfL roundel itself is a trademark, so it isn't used.

**Photos:** each stop's `wiki` field names the Wikipedia article whose lead photo is shown. Photos come from Wikimedia Commons and load the first time the app is opened online. After that they're cached for offline use, so open every day once before you travel. Each stop page links to the photo's file page, which gives its author and licence.

## Editing the content

Everything lives in **`data/itinerary.js`**. The schema is documented in the comment at the top of that file.

- **Shift the dates:** change `settings.day1Date` (`"2026-12-05"`). Day N = Day 1 + (N-1).
- **Flight:** `flight` holds the Wizz Air details (Luton, W4 3648, 20:25 on Tue 8 Dec) shown on the Day 5 airport page.
- **Add or edit a stop:** copy an existing item. `book` puts it on the checklist, `checks` adds *Check before you go* tags, `light: "day"` adds the sunset warning, `alerts` adds clash notes.
- **After any edit, bump `CACHE_VERSION` in `sw.js`** (e.g. `ldn26-v2`) so installed phones fetch the new version. Open the app twice while online to pick it up.

To test a particular date, add `?today=2026-12-06` to the URL.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

(The service worker needs `http://localhost` or HTTPS; opening `index.html` as a file works but without offline mode.)

## Deploy for free

All paths are relative, so it works from a sub-path such as `https://<user>.github.io/england-guide/`.

**GitHub Pages**
1. Push this folder to a GitHub repository (e.g. `england-guide`) on the `main` branch.
2. Repository → **Settings → Pages** → *Build and deployment* → Source: **Deploy from a branch** → Branch: `main`, folder `/ (root)` → **Save**.
3. After about a minute the site is live at `https://<your-user>.github.io/england-guide/`.

**Netlify**
1. Go to app.netlify.com → **Add new site → Deploy manually**, and drag this folder onto the page. Or connect the GitHub repo with no build command and publish directory `/`.

**Install on your phone:** open the URL in Safari (iOS) → Share → **Add to Home Screen**, or in Chrome (Android) → ⋮ → **Install app**. Open it once while online, so everything is cached, before you go underground.

## Accuracy

Facts were researched in late October 2026 using official sources where reachable (Royal Museums Greenwich, Southbank Centre, Tower Bridge, Borough Market, Sky Garden, Household Division) and reputable secondary sources otherwise. Each stop lists its sources. Anything that couldn't be confirmed for December 2026 carries a red **Check before you go** tag. The full list is on the in-app **Plan check** page.
