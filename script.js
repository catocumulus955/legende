// Nedtelling for Legendeløpet 2025
(function countdownInit() {
  const targetDate = new Date("2026-12-19T11:00:00");
  const timerElement = document.getElementById("timer");
  function tick() {
    const now = new Date();
    const diff = targetDate - now;
    if (diff <= 0) {
      timerElement.textContent = "Løpet har startet!";
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    timerElement.textContent = `${days} dager ${hours}t ${minutes}m ${seconds}s`;
  }
  tick();
  setInterval(tick, 1000);
})();

// Lightweight Lightbox: applies to ALL images
(function lightboxInit() {
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");

  function openLightbox(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || "Forstørret bilde";
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden"; // Prevent background scroll
  }

  function closeLightbox() {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    lbImg.removeAttribute("src");
    document.documentElement.style.overflow = "";
  }

  // Click ANYWHERE to close
  lb.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  // Delegate clicks to all <img>
  document.addEventListener(
    "click",
    (e) => {
      const t = e.target;
      if (t && t.tagName === "IMG" && !lb.contains(t)) {
        // If image has srcset/sizes, prefer currentSrc
        const src = t.currentSrc || t.src;
        openLightbox(src, t.alt || "");
      }
    },
    true,
  );
})();
