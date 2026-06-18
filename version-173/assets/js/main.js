(() => {
  const ready = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  };

  ready(() => {
    initMobileNav();
    initHeroSlider();
    initFilters();
    initPlayers();
  });

  function initMobileNav() {
    const button = document.querySelector("[data-mobile-toggle]");
    const nav = document.querySelector("[data-site-nav]");
    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", () => {
      nav.classList.toggle("is-open");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => nav.classList.remove("is-open"));
    });
  }

  function initHeroSlider() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    const slides = [...hero.querySelectorAll("[data-hero-slide]")];
    const dots = [...hero.querySelectorAll("[data-hero-dot]")];
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    const restart = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(index + 1), 5000);
    };

    prev?.addEventListener("click", () => {
      show(index - 1);
      restart();
    });

    next?.addEventListener("click", () => {
      show(index + 1);
      restart();
    });

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        show(Number(dot.dataset.heroDot || 0));
        restart();
      });
    });

    if (slides.length > 1) {
      restart();
    }
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-panel]").forEach((panel) => {
      const scope = panel.parentElement || document;
      const cards = [...scope.querySelectorAll("[data-movie-card]")];
      const input = panel.querySelector("[data-filter-input]");
      const yearSelect = panel.querySelector("[data-filter-year]");
      const typeSelect = panel.querySelector("[data-filter-type]");
      const categorySelect = panel.querySelector("[data-filter-category]");
      const count = panel.querySelector("[data-result-count]");

      hydrateSelect(yearSelect, uniqueValues(cards, "year"));
      hydrateSelect(typeSelect, uniqueValues(cards, "type"));

      const apply = () => {
        const query = (input?.value || "").trim().toLowerCase();
        const year = yearSelect?.value || "all";
        const type = typeSelect?.value || "all";
        const category = categorySelect?.value || "all";
        let visible = 0;

        cards.forEach((card) => {
          const matchesQuery = !query || (card.dataset.search || "").includes(query);
          const matchesYear = year === "all" || card.dataset.year === year;
          const matchesType = type === "all" || card.dataset.type === type;
          const matchesCategory = category === "all" || card.dataset.category === category;
          const shouldShow = matchesQuery && matchesYear && matchesType && matchesCategory;

          card.classList.toggle("is-filtered-out", !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = `显示 ${visible} / ${cards.length} 部`;
        }
      };

      [input, yearSelect, typeSelect, categorySelect].forEach((control) => {
        control?.addEventListener("input", apply);
        control?.addEventListener("change", apply);
      });
    });
  }

  function uniqueValues(cards, key) {
    const values = new Set();
    cards.forEach((card) => {
      const value = card.dataset[key];
      if (value) {
        values.add(value);
      }
    });
    return [...values].sort((a, b) => String(b).localeCompare(String(a), "zh-Hans-CN"));
  }

  function hydrateSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initPlayers() {
    document.querySelectorAll("[data-player]").forEach((panel) => {
      const video = panel.querySelector("video");
      const button = panel.querySelector("[data-player-start]");
      const src = panel.dataset.videoSrc;

      if (!video || !button || !src) {
        return;
      }

      let hasStarted = false;

      const start = async () => {
        if (hasStarted) {
          try {
            await video.play();
          } catch (error) {
            console.warn("Video play was interrupted.", error);
          }
          return;
        }

        hasStarted = true;
        button.classList.add("is-hidden");

        if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch((error) => console.warn("Autoplay prevented.", error));
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          video.addEventListener("loadedmetadata", () => {
            video.play().catch((error) => console.warn("Autoplay prevented.", error));
          }, { once: true });
        } else {
          video.src = src;
          try {
            await video.play();
          } catch (error) {
            window.open(src, "_blank", "noopener");
          }
        }
      };

      button.addEventListener("click", start);
      video.addEventListener("play", () => button.classList.add("is-hidden"));
      video.addEventListener("pause", () => {
        if (!video.ended) {
          button.classList.remove("is-hidden");
        }
      });
    });
  }
})();
