/* ==============================================================
   MAP — real coastline. Natural Earth 10m admin/lake polygons,
   clipped to the west coast and simplified, projected
   equirectangular. The route follows the actual road corridor
   (A82 / A830 / A87) rather than straight lines between stops.
   ============================================================== */

/* Road corridor, [lon, lat]. Ferry leg is separate. */
const ROUTE = [
  { type:"road", pts:[
    [-4.2518,55.8642],[-4.4200,55.9000],[-4.5650,55.9450],[-4.5800,56.0000],[-4.6100,56.0600],
    [-4.6400,56.1017],[-4.7230,56.1620],[-4.7130,56.2040],[-4.7200,56.3000],[-4.6180,56.3920],
    [-4.7120,56.4370],[-4.7690,56.5200],[-4.8300,56.5900],[-4.9050,56.6450],[-4.9950,56.6690],
    [-5.1010,56.6800],[-5.1830,56.6870],[-5.2210,56.7000],[-5.2430,56.7260],[-5.1900,56.7800],
    [-5.1052,56.8198],[-5.1300,56.8430],[-5.3150,56.8550],[-5.4330,56.8720],[-5.5600,56.8800],
    [-5.6670,56.8790],[-5.7700,56.8950],[-5.8430,56.9110],[-5.8260,56.9630],[-5.8290,57.0064]
  ]},
  { type:"ferry", pts:[[-5.8290,57.0064],[-5.8930,57.0640]] },
  { type:"road", pts:[
    [-5.8930,57.0640],[-5.8500,57.1000],[-5.8080,57.1570],[-5.8600,57.2000],[-5.9130,57.2400],
    [-5.9800,57.2600],[-6.0430,57.2780],[-6.1120,57.3130],[-6.1690,57.2900],[-6.1800,57.3400],
    [-6.1950,57.4130],[-6.1700,57.4600],[-6.1820,57.5070],[-6.1700,57.5600],[-6.1690,57.6060],
    [-6.2120,57.6300],[-6.2950,57.6430],[-6.3400,57.6200],[-6.3710,57.5860],[-6.3300,57.5200],
    [-6.2600,57.4600],[-6.1950,57.4130],[-6.1120,57.3130],[-6.0430,57.2780],[-5.9130,57.2400],
    [-5.8200,57.2700],[-5.7400,57.2760],[-5.7140,57.2800],[-5.6200,57.2760],[-5.5160,57.2740],
    [-5.4600,57.2400],[-5.4060,57.1830],[-5.3000,57.1500],[-5.1480,57.1330],[-5.0000,57.0900],
    [-4.8800,57.0500],[-4.7820,57.0330],[-4.8300,56.9600],[-4.9210,56.8920],[-5.0300,56.8500],
    [-5.1052,56.8198],[-5.2430,56.7260],[-5.2210,56.7000],[-5.1830,56.6870],[-5.1010,56.6800],
    [-4.9950,56.6690],[-4.9050,56.6450],[-4.8300,56.5900],[-4.7690,56.5200],[-4.7120,56.4370],
    [-4.6180,56.3920],[-4.7200,56.3000],[-4.7130,56.2040],[-4.7230,56.1620],[-4.6400,56.1017],
    [-4.5800,56.0000],[-4.5650,55.9450],[-4.4200,55.9000],[-4.2518,55.8642]
  ]}
];

const MAP_VIEWS = [
  { id:"route", label:"Whole route", grat:.5,
    bb:{ w:-7.30, e:-3.85, s:55.55, n:58.05 },
    places:[
      { t:"Outer Hebrides", lon:-7.22, lat:57.60, a:"start", sea:false },
      { t:"Isle of Skye",   lon:-6.52, lat:57.24, a:"start", sea:false },
      { t:"Mull",           lon:-6.10, lat:56.48, a:"start", sea:false },
      { t:"Rannoch Moor",   lon:-4.62, lat:56.66, a:"start", sea:false },
      { t:"The Minch",      lon:-6.60, lat:57.92, a:"middle", sea:true },
      { t:"Sea of the Hebrides", lon:-6.75, lat:56.90, a:"middle", sea:true },
      { t:"Firth of Clyde", lon:-5.00, lat:55.72, a:"middle", sea:true }
    ] },
  { id:"skye", label:"Isle of Skye", grat:.25,
    bb:{ w:-6.62, e:-5.42, s:57.00, n:57.76 },
    places:[
      { t:"Trotternish", lon:-6.28, lat:57.55, a:"start", sea:false },
      { t:"The Cuillin", lon:-6.28, lat:57.22, a:"start", sea:false },
      { t:"Raasay",      lon:-6.03, lat:57.40, a:"start", sea:false },
      { t:"Sound of Sleat", lon:-5.78, lat:57.09, a:"middle", sea:true },
      { t:"The Little Minch", lon:-6.55, lat:57.62, a:"middle", sea:true }
    ] },
  { id:"mainland", label:"Mainland leg", grat:.5,
    bb:{ w:-5.95, e:-4.05, s:55.70, n:57.05 },
    places:[
      { t:"Rannoch Moor", lon:-4.72, lat:56.62, a:"start", sea:false },
      { t:"The Great Glen", lon:-4.95, lat:56.98, a:"start", sea:false },
      { t:"Loch Linnhe", lon:-5.45, lat:56.62, a:"middle", sea:true },
      { t:"Loch Lomond", lon:-4.55, lat:56.20, a:"start", sea:true }
    ] }
];

(function mapModule(){
  const svg = $("#mapSvg");
  const detail = $("#mapDetail");
  const viewsEl = $("#mapViews");
  const K = Math.cos(56.7 * Math.PI / 180);

  /* one marker per physical place; a place visited twice keeps both numbers */
  const GROUPS = [];
  TRIP.waypoints.forEach(w => {
    const key = w.lat + "," + w.lon;
    let g = GROUPS.find(v => v.key === key);
    if (!g){ g = { key, lat:w.lat, lon:w.lon, kind:w.kind, name:w.name, ns:[], wps:[] }; GROUPS.push(g); }
    g.ns.push(w.n); g.wps.push(w);
    if (w.kind === "attract" || w.kind === "start" || w.kind === "camp") g.kind = w.kind;
  });

  let viewId = "route";
  let selected = 1;

  viewsEl.innerHTML = MAP_VIEWS.map(v =>
    '<button class="viewbtn" data-view="' + v.id + '" aria-pressed="false">' + esc(v.label) + '</button>').join("");

  function render(){
    const view = MAP_VIEWS.find(v => v.id === viewId);
    const bb = view.bb;
    const dw = (bb.e - bb.w) * K, dh = bb.n - bb.s;
    const S = Math.min(480 / dw, 660 / dh);
    const W = dw * S, H = dh * S;
    const X = lon => ((lon - bb.w) * K * S);
    const Y = lat => ((bb.n - lat) * S);
    const inView = (lon, lat) => lon >= bb.w && lon <= bb.e && lat >= bb.s && lat <= bb.n;
    const ring = r => "M" + r.map(p => X(p[0]).toFixed(1) + "," + Y(p[1]).toFixed(1)).join("L") + "Z";
    const line = pts => "M" + pts.map(p => X(p[0]).toFixed(1) + "," + Y(p[1]).toFixed(1)).join("L");

    let s = '<defs><clipPath id="mapClip"><rect x="0" y="0" width="' + W.toFixed(1) + '" height="' + H.toFixed(1) + '"/></clipPath></defs>';
    s += '<g clip-path="url(#mapClip)">';
    s += '<rect class="sea-fill" x="0" y="0" width="' + W.toFixed(1) + '" height="' + H.toFixed(1) + '"/>';

    /* land + freshwater */
    s += '<path class="land" d="' + MAPGEO.land.map(ring).join("") + '"/>';
    if (MAPGEO.lakes.length) s += '<path class="lake" d="' + MAPGEO.lakes.map(ring).join("") + '"/>';

    /* graticule */
    const step = view.grat;
    for (let lat = Math.ceil(bb.s / step) * step; lat <= bb.n; lat += step){
      const y = Y(lat);
      s += '<line class="graticule" x1="0" y1="' + y.toFixed(1) + '" x2="' + W.toFixed(1) + '" y2="' + y.toFixed(1) + '"/>';
      s += '<text class="grat-label" x="4" y="' + (y - 3).toFixed(1) + '">' + lat.toFixed(2).replace(/0$/,"") + '°N</text>';
    }
    for (let lon = Math.ceil(bb.w / step) * step; lon <= bb.e; lon += step){
      const x = X(lon);
      s += '<line class="graticule" x1="' + x.toFixed(1) + '" y1="0" x2="' + x.toFixed(1) + '" y2="' + H.toFixed(1) + '"/>';
      s += '<text class="grat-label" x="' + (x + 4).toFixed(1) + '" y="11">' + Math.abs(lon).toFixed(2).replace(/0$/,"") + '°W</text>';
    }

    /* place names */
    view.places.forEach(p => {
      if (!inView(p.lon, p.lat)) return;
      s += '<text class="place-label' + (p.sea ? " sea" : "") + '" x="' + X(p.lon).toFixed(1) + '" y="' + Y(p.lat).toFixed(1) + '" text-anchor="' + p.a + '">' + esc(p.t) + '</text>';
    });

    /* route */
    ROUTE.forEach(seg => {
      if (seg.type === "road"){
        s += '<path class="leg-road-halo" d="' + line(seg.pts) + '"/>';
      }
    });
    ROUTE.forEach(seg => {
      s += '<path class="' + (seg.type === "ferry" ? "leg-ferry" : "leg-road") + '" d="' + line(seg.pts) + '"/>';
    });

    /* waypoints */
    const shape = (kind, x, y) => {
      if (kind === "start")   return '<path class="wp-shape" d="M' + x + ',' + (y-6.5) + 'L' + (x+6) + ',' + y + 'L' + x + ',' + (y+6.5) + 'L' + (x-6) + ',' + y + 'Z" fill="var(--accent)"/>';
      if (kind === "ferry")   return '<path class="wp-shape" d="M' + x + ',' + (y-6) + 'L' + (x+5.6) + ',' + (y+4.5) + 'L' + (x-5.6) + ',' + (y+4.5) + 'Z" fill="var(--accent)"/>';
      if (kind === "camp")    return '<rect class="wp-shape" x="' + (x-4.8) + '" y="' + (y-4.8) + '" width="9.6" height="9.6" rx="2" fill="var(--moss-lit)"/>';
      if (kind === "attract") return '<circle class="wp-shape" cx="' + x + '" cy="' + y + '" r="5" fill="var(--slate-lit)"/>';
      return '<circle class="wp-shape" cx="' + x + '" cy="' + y + '" r="3.6" fill="none" stroke="var(--text-3)" stroke-width="2"/>';
    };
    GROUPS.forEach(g => {
      if (!inView(g.lon, g.lat)) return;
      const x = +X(g.lon).toFixed(1), y = +Y(g.lat).toFixed(1);
      const left = x > W * 0.54;
      const tx = left ? x - 11 : x + 11;
      const label = g.ns.join("·") + ". " + g.name;
      const on = g.ns.includes(selected);
      s += '<g class="wp' + (on ? " sel" : "") + '" data-n="' + g.ns[0] + '" tabindex="0" role="button" aria-label="Waypoint ' + label + '">' +
             '<circle class="wp-hit" cx="' + x + '" cy="' + y + '" r="14"/>' +
             shape(g.kind, x, y) +
             '<text x="' + tx + '" y="' + (y + 3) + '" text-anchor="' + (left ? "end" : "start") + '">' + esc(label) + '</text>' +
           '</g>';
    });
    s += '</g>';

    /* scale bar — 50 km at this latitude */
    const km50 = (50 / 111.32) * S;
    const sbX = 14, sbY = H - 16;
    s += '<g class="map-scale">' +
         '<line x1="' + sbX + '" y1="' + sbY.toFixed(1) + '" x2="' + (sbX + km50).toFixed(1) + '" y2="' + sbY.toFixed(1) + '"/>' +
         '<line x1="' + sbX + '" y1="' + (sbY - 4).toFixed(1) + '" x2="' + sbX + '" y2="' + (sbY + 4).toFixed(1) + '"/>' +
         '<line x1="' + (sbX + km50).toFixed(1) + '" y1="' + (sbY - 4).toFixed(1) + '" x2="' + (sbX + km50).toFixed(1) + '" y2="' + (sbY + 4).toFixed(1) + '"/>' +
         '<text x="' + (sbX + km50 / 2).toFixed(1) + '" y="' + (sbY - 8).toFixed(1) + '" text-anchor="middle">50 km</text></g>';

    /* north arrow */
    const nx = W - 22, ny = 26;
    s += '<g class="compass"><path d="M' + nx + ',' + (ny - 13) + 'L' + (nx + 4.5) + ',' + (ny + 3) + 'L' + nx + ',' + (ny - 1) + 'L' + (nx - 4.5) + ',' + (ny + 3) + 'Z" fill="var(--text-3)"/>' +
         '<text x="' + nx + '" y="' + (ny + 15) + '" text-anchor="middle">N</text></g>';

    svg.setAttribute("viewBox", "0 0 " + W.toFixed(1) + " " + H.toFixed(1));
    svg.innerHTML = s;

    $$(".viewbtn", viewsEl).forEach(b => b.setAttribute("aria-pressed", String(b.dataset.view === viewId)));
  }

  function selectWp(n){
    selected = n;
    const g = GROUPS.find(v => v.ns.includes(n));
    const w = g.wps[0];
    const kindLabel = { start:"Start / finish", ferry:"Ferry port", camp:"Overnight", attract:"Attraction", scenic:"Scenic stop" }[w.kind];
    const days = g.wps.map(v => "Day " + v.day).join(" & ");
    const repeat = g.wps.length > 1
      ? '<p class="small muted">Passed twice — waypoint ' + g.ns.join(" and ") + '. ' + esc(g.wps[1].desc) + '</p>' : "";
    detail.innerHTML =
      '<p class="num">Waypoint ' + g.ns.map(v => String(v).padStart(2,"0")).join(" · ") + ' · ' + days + '</p>' +
      '<h4>' + esc(w.name) + '</h4>' +
      '<p>' + esc(w.desc) + '</p>' + repeat +
      '<p class="coords">' + w.lat.toFixed(4) + '° N, ' + Math.abs(w.lon).toFixed(4) + '° W · ' + kindLabel + '</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:auto;padding-top:6px">' +
        g.wps.map(v => '<a class="btn btn-line btn-sm" href="#day' + v.day + '">Day ' + v.day + '</a>').join("") +
      '</div>';
    $$(".wp", svg).forEach(el => el.classList.toggle("sel", GROUPS.find(v => v.ns.includes(+el.dataset.n)).ns.includes(n)));
  }

  svg.addEventListener("click", e => {
    const g = e.target.closest(".wp"); if (g) selectWp(+g.dataset.n);
  });
  svg.addEventListener("keydown", e => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const g = e.target.closest(".wp"); if (g){ e.preventDefault(); selectWp(+g.dataset.n); }
  });
  viewsEl.addEventListener("click", e => {
    const b = e.target.closest(".viewbtn"); if (!b) return;
    viewId = b.dataset.view; render(); selectWp(selected);
  });

  render();
  selectWp(1);
})();
