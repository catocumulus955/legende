// Mobilmeny
(() => {
  const btn = document.querySelector(".menu-toggle");
  const nav = document.getElementById("nav");
  if (!btn || !nav) return;
  const set = (open) => { nav.classList.toggle("open", open); btn.setAttribute("aria-expanded", open); };
  btn.addEventListener("click", () => set(!nav.classList.contains("open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
})();

// Nedtelling (kun på forsiden). Husk å oppdatere datoen hvert år.
(() => {
  const el = document.getElementById("timer");
  if (!el) return;
  const target = new Date("2026-12-19T11:00:00");
  const tick = () => {
    const d = target - new Date();
    if (d <= 0) { el.textContent = "Løpet har startet!"; return; }
    const days = Math.floor(d / 864e5), h = Math.floor(d / 36e5) % 24, m = Math.floor(d / 6e4) % 60, s = Math.floor(d / 1e3) % 60;
    el.textContent = `${days} dager ${h}t ${m}m ${s}s`;
  };
  tick();
  setInterval(tick, 1000);
})();

// Lightbox for bilder i <main> (kun på forsiden)
(() => {
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  const img = lb.querySelector("img");
  const close = () => { lb.classList.remove("open"); img.removeAttribute("src"); };
  document.querySelector("main").addEventListener("click", (e) => {
    if (e.target.tagName !== "IMG") return;
    img.src = e.target.currentSrc || e.target.src;
    img.alt = e.target.alt;
    lb.classList.add("open");
  });
  lb.addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();
