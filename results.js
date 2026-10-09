firebase.initializeApp({
  apiKey: "AIzaSyCfaUa6FEEj55L8YqdKTe5YE3mMLHqDBW4",
  authDomain: "legendelopet-resultat.firebaseapp.com",
  projectId: "legendelopet-resultat",
  storageBucket: "legendelopet-resultat.appspot.com",
  messagingSenderId: "982148824748",
  appId: "1:982148824748:web:878a9fb9d58f93d564a909",
  measurementId: "G-QMF0EKMT47",
});
const db = firebase.firestore();

const $ = (id) => document.getElementById(id);
const toSec = (t) => {
  const [m, s] = t.split(":").map(Number);
  return m * 60 + s;
};
const fmt = (sec) => {
  const r = Math.round(sec);
  return `${Math.floor(r / 60)}:${String(r % 60).padStart(2, "0")}`;
};
const pace = (t) => fmt(toSec(t) / 3.02); // løypa er 3 km

let results = [];
let chart;
let current = "all";

// ---------- Data ----------
db.collection("results")
  .get()
  .then((snap) => {
    results = snap.docs
      .map((d) => d.data())
      .filter((r) => r.time_display && r.year);
    results.sort((a, b) => toSec(a.time_display) - toSec(b.time_display));
    const perYear = {};
    results.forEach((r, i) => {
      r.allRank = i + 1;
      r.pace = pace(r.time_display);
      perYear[r.year] = (perYear[r.year] || 0) + 1;
      r.rank = perYear[r.year]; // plassering det året (sortert på tid)
    });
    buildTabs();
    show("all");
  })
  .catch((err) => {
    console.error(err);
    $("results").innerHTML =
      '<p class="status">Kunne ikke hente resultater. Prøv igjen senere.</p>';
  });

// ---------- Visning ----------
function buildTabs() {
  const years = [...new Set(results.map((r) => r.year))].sort((a, b) => a - b);
  const tabs = $("tabs");
  ["all", ...years].forEach((y) => {
    const b = document.createElement("button");
    b.dataset.year = y;
    b.textContent = y === "all" ? "Alle tider" : y;
    b.addEventListener("click", () => show(y === "all" ? "all" : Number(y)));
    tabs.appendChild(b);
  });
}

function table(headers, rows) {
  const wrap = document.createElement("div");
  wrap.className = "table-wrap";
  const t = document.createElement("table");
  t.innerHTML = "<thead><tr></tr></thead><tbody></tbody>";
  headers.forEach((h) =>
    t
      .querySelector("tr")
      .appendChild(
        Object.assign(document.createElement("th"), { textContent: h }),
      ),
  );
  rows.forEach((cells) => {
    const tr = document.createElement("tr");
    cells.forEach((c) => {
      const td = document.createElement("td");
      c instanceof Node ? td.appendChild(c) : (td.textContent = c);
      tr.appendChild(td);
    });
    t.tBodies[0].appendChild(tr);
  });
  wrap.appendChild(t);
  return wrap;
}

function nameLink(r) {
  if (!r.athlete_id) return r.name;
  const a = document.createElement("a");
  a.href = "#";
  a.textContent = r.name;
  a.addEventListener("click", (e) => {
    e.preventDefault();
    showAthlete(r.athlete_id);
  });
  return a;
}

function reset(year) {
  current = year;
  $("chart-box").hidden = true;
  $("back").innerHTML = "";
  document
    .querySelectorAll("#tabs button")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.year == year)),
    );
  $("search").hidden = year !== "all";
}

function show(year) {
  reset(year);
  const q = $("search").value.trim().toLowerCase();
  let list;
  let headers;
  let row;
  if (year === "all") {
    list = results.filter((r) => r.name.toLowerCase().includes(q));
    headers = ["Plass", "Navn", "Tid", "Fart", "År", "Plass det året"];
    row = (r) => [
      r.allRank,
      nameLink(r),
      r.time_display,
      r.pace,
      r.year,
      r.rank,
    ];
  } else {
    list = results.filter((r) => r.year === year);
    const best = toSec(list[0].time_display);
    headers = ["Plass", "Navn", "Tid", "Fart", "Bak"];
    row = (r) => [
      r.rank,
      nameLink(r),
      r.time_display,
      r.pace,
      r.rank === 1 ? "–" : "+" + fmt(toSec(r.time_display) - best),
    ];
  }
  const box = $("results");
  box.innerHTML = "";
  if (!list.length) {
    box.innerHTML = '<p class="status">Ingen resultater funnet.</p>';
    return;
  }
  box.appendChild(table(headers, list.map(row)));
}

function showAthlete(id) {
  const rs = results
    .filter((r) => r.athlete_id === id)
    .sort((a, b) => a.year - b.year);
  if (!rs.length) return;
  reset("athlete");
  document
    .querySelectorAll("#tabs button")
    .forEach((b) => b.setAttribute("aria-pressed", "false"));
  const back = Object.assign(document.createElement("button"), {
    className: "btn dark",
    textContent: "← Alle resultater",
  });
  back.addEventListener("click", () => show("all"));
  $("back").appendChild(back);

  const box = $("results");
  box.innerHTML = "";
  box.appendChild(
    table(
      ["År", "Tid", "Fart", "Plass det året"],
      rs.map((r) => [r.year, r.time_display, r.pace, r.rank]),
    ),
  );
  drawChart(rs[0].name, rs);
}

// ---------- Graf ----------
function trend(x, y) {
  const n = x.length;
  const sx = x.reduce((a, b) => a + b, 0),
    sy = y.reduce((a, b) => a + b, 0);
  const sxy = x.reduce((a, v, i) => a + v * y[i], 0),
    sxx = x.reduce((a, v) => a + v * v, 0);
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  return x.map((v) => slope * v + (sy - slope * sx) / n);
}

function drawChart(name, rs) {
  const years = rs.map((r) => r.year);
  const times = rs.map((r) => toSec(r.time_display));
  const datasets = [
    {
      label: "Tid",
      data: times,
      borderColor: "#1d1d1b",
      backgroundColor: "#1d1d1b",
      tension: 0.3,
    },
  ];
  if (rs.length > 1) {
    datasets.push({
      label: "Trendlinje",
      data: trend(years, times),
      borderColor: "#d9a900",
      borderWidth: 2,
      borderDash: [5, 5],
      pointRadius: 0,
    });
  }
  $("chart-box").hidden = false;
  $("chart-title").textContent = `${name} over tid`;
  if (chart) chart.destroy();
  chart = new Chart($("chart"), {
    type: "line",
    data: { labels: years, datasets },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: { label: (c) => `${c.dataset.label}: ${fmt(c.parsed.y)}` },
        },
      },
      scales: {
        x: { title: { display: true, text: "År" } },
        y: {
          reverse: true,
          title: { display: true, text: "Tid (min:sek)" },
          ticks: { callback: fmt },
        },
      },
    },
  });
}

$("search").addEventListener("input", () => current === "all" && show("all"));
