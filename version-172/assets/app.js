(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    document.querySelectorAll(".js-hero-slider").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
      var index = 0;
      var timer = null;

      function show(next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });

      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll(".js-card-list").forEach(function (list) {
      var section = list.closest("section") || document;
      var search = section.querySelector(".js-card-search");
      var sort = section.querySelector(".js-card-sort");
      var empty = section.querySelector(".js-empty-state");
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

      function textOf(card) {
        return [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-tags") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-year") || ""
        ].join(" ").toLowerCase();
      }

      function applyFilter() {
        var query = search ? search.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var match = !query || textOf(card).indexOf(query) !== -1;
          card.style.display = match ? "" : "none";
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      function applySort() {
        if (!sort) {
          return;
        }
        var value = sort.value;
        var sorted = cards.slice();
        sorted.sort(function (a, b) {
          if (value === "heat") {
            return Number(b.getAttribute("data-heat") || 0) - Number(a.getAttribute("data-heat") || 0);
          }
          if (value === "year") {
            return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
          }
          if (value === "title") {
            return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
          }
          return 0;
        });
        sorted.forEach(function (card) {
          list.appendChild(card);
        });
      }

      if (search) {
        search.addEventListener("input", applyFilter);
      }
      if (sort) {
        sort.addEventListener("change", function () {
          applySort();
          applyFilter();
        });
      }
      applyFilter();
    });

    document.querySelectorAll("[data-scroll-player]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        var player = document.querySelector(".player-card");
        if (player) {
          event.preventDefault();
          player.scrollIntoView({ behavior: "smooth", block: "center" });
          var button = player.querySelector(".player-overlay");
          if (button) {
            button.focus({ preventScroll: true });
          }
        }
      });
    });
  });
})();
