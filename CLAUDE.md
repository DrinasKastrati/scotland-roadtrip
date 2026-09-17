# Scotland Campervan Road Trip — website

Static single-page site for a 4-night campervan trip (16–20 September 2026), hosted on GitHub Pages.
The owner edits it from the Claude mobile app while travelling, so keep changes quick and safe.

## Structure

- `index.html` — the entire live site. HTML, CSS, JS, map geometry and itinerary data are all inline. No build step.
- `map.js`, `geo.json` — reference copies of the map module and coastline data. The live versions are inlined in `index.html`; edit there.
- `Scotland Campervan Road Trip Website Prompt.md` — original brief. Reference only; the site has since diverged (e.g. route changes).

Key data objects inside `index.html` (search by name, line numbers drift):

- `const TRIP` — itinerary: days, timelines, overnight stops, Google Maps links, waypoints for the map.
- `const STAYS` — overnight stays summary.
- `const ROUTE` — road polyline drawn on the map ([lon, lat] pairs).
- `const MAP_VIEWS` — map zoom presets and labels.

Most content changes (times, stops, campsites, links, notes) belong in `TRIP`, not in hand-written HTML.

## Workflow for updates

1. Make the requested change in `index.html`.
2. Sanity-check: the `<script>` must still parse (balanced braces/quotes, commas between object entries). If Node is available, extract and check with `node --check`.
3. Commit with a short descriptive message and push directly to `main`. GitHub Pages redeploys in about a minute.
   Do not leave changes on a side branch or open a PR unless asked — the owner is on a phone and wants the live site updated.
4. Tell the owner what changed and that the site will refresh shortly.

## Rules

- Keep the site a single self-contained `index.html`; external requests only to Google Fonts and the linked official sites.
- External links open in a new tab with `target="_blank" rel="noopener"`.
- Checklist, progress and Road Mode state live in the visitor's `localStorage` under versioned keys `scotland-roadtrip-v3.*` (`TRIP.config.storageKey`). Do not rename them, or saved ticks are lost. The old `scot26.*` keys are migrated once on load.
- Priorities: each waypoint in `TRIP.waypoints` has `prio` (`must` / `high` / `opt` / `skip`, or `null` for practical stops), `time`, `next`, `skip` and a Google Maps query `q`. Timeline items link to a waypoint with `wp:n`.
- Saturday deadline logic reads `TRIP.config.deadline` (hard 17:00, green before 16:15, red after 16:40) and each Day 4 waypoint's `toGla` and `stopMin`. The trip now finishes at **Larkhall, South Lanarkshire**, not Glasgow; `toGla` keeps its name but means driving minutes left to Larkhall. Destination names in rendered text come from `TRIP.config.deadline.where` — change the config, not the strings.
- Map lines come from `ROUTE`; each segment has a `day` and is drawn in that day's colour. Saturday returns via Loch Ness, the A86 and the A9, then the M80/M73 onto the M74 to Larkhall — never via Glencoe or Loch Lomond, and it skirts Glasgow rather than entering it.
