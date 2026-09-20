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
- Day 2 crosses to Skye by road (A82 to Invergarry, A87 through Glen Shiel, Skye Bridge) — the Mallaig ferry was unavailable and is gone from the trip. Waypoint numbers 8-12 were reused rather than renumbered so saved progress stays valid, so `kind:"ferry"` now marks the Skye Bridge crossing and `TRIP.ferryLeg` is stale, unused data.
- Priorities: each waypoint in `TRIP.waypoints` has `prio` (`must` / `high` / `opt` / `skip`, or `null` for practical stops), `time`, `next`, `skip` and a Google Maps query `q`. Timeline items link to a waypoint with `wp:n`.
- Saturday deadline logic reads `TRIP.config.deadline` (hard 17:15, green before 17:00, red after 17:10 — the owner confirmed a 17:15-17:30 handover window and the conservative end of it is used) and each Day 4 waypoint's `toGla` and `stopMin`. The trip now finishes at **Larkhall, South Lanarkshire**, not Glasgow; `toGla` keeps its name but means driving minutes left to Larkhall. Destination names in rendered text come from `TRIP.config.deadline.where` — change the config, not the strings.
- Photo tool (`#photo` section, the IIFE at the end of the script): strips metadata from an uploaded image and hands back a clean PNG or JPG. Runs entirely client-side, no uploads. Same format in and out is a pure copy with the metadata cut out, no re-encode: JPEG keeps the entropy-coded scan and drops APPn/COM (except APP14 Adobe, which is the colour transform, not personal data); PNG keeps IHDR/PLTE/tRNS/IDAT/IEND plus gAMA/cHRM/sRGB/sBIT and the APNG chunks, and drops tEXt/zTXt/iTXt/eXIf/tIME/iCCP/pHYs/sPLT/hIST/dSIG/bKGD. Bit depth, palette and animation therefore survive PNG to PNG.
- Changing format goes through a canvas: PNG out is pixel-exact but flattens 16-bit to 8-bit and animation to one frame; JPEG out is lossy. A JPEG whose EXIF orientation is not 1 also has to be re-encoded, because dropping the tag would leave the picture on its side. Canvas-encoded JPEGs are run back through the stripper, since the browser's own encoder writes a JFIF header and an sRGB ICC profile.
- Map lines come from `ROUTE`; each segment has a `day` and is drawn in that day's colour. Saturday now returns WEST for Kilchurn Castle: A87 to Invergarry, south on the A82 through Fort William and Glencoe to Tyndrum, west on the A85 to Kilchurn on Loch Awe, then back down Loch Lomond and the M74 to Larkhall. The earlier "never via Glencoe or Loch Lomond" rule no longer applies — it was replaced when the owner asked for Kilchurn.
