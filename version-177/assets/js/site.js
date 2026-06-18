(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobileNav.classList.toggle('is-open', !expanded);
    });
  }

  var sliders = document.querySelectorAll('[data-hero-slider]');

  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 6500);
    }
  });

  var grids = document.querySelectorAll('[data-card-grid]');

  grids.forEach(function (grid) {
    var scope = grid.closest('section') || document;
    var input = scope.querySelector('[data-search-input]');
    var select = scope.querySelector('[data-sort-select]');
    var empty = scope.querySelector('[data-no-result]');

    function getCards() {
      return Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
    }

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;

      getCards().forEach(function (card) {
        var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        var matched = !query || text.indexOf(query) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    function applySort() {
      if (!select) {
        return;
      }

      var mode = select.value;
      var cards = getCards();

      cards.sort(function (a, b) {
        if (mode === 'year-asc') {
          return Number(a.getAttribute('data-year') || 0) - Number(b.getAttribute('data-year') || 0);
        }

        if (mode === 'title') {
          return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
        }

        return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
      });

      cards.forEach(function (card) {
        grid.appendChild(card);
      });

      applyFilter();
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (select) {
      select.addEventListener('change', applySort);
    }
  });

  function getPlayerElements(box) {
    return {
      video: box.querySelector('video[data-stream]'),
      button: box.querySelector('[data-play-button]')
    };
  }

  function startPlayer(box) {
    var parts = getPlayerElements(box);
    var video = parts.video;
    var button = parts.button;

    if (!video) {
      return;
    }

    var stream = (video.getAttribute('data-stream') || '').trim();

    if (!stream) {
      return;
    }

    if (button) {
      button.classList.add('is-hidden');
    }

    if (video.dataset.ready === '1') {
      video.play().catch(function () {});
      return;
    }

    video.dataset.ready = '1';

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      hls.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.play().catch(function () {});
    } else {
      video.src = stream;
      video.play().catch(function () {});
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (box) {
    var parts = getPlayerElements(box);

    if (parts.button) {
      parts.button.addEventListener('click', function () {
        startPlayer(box);
      });
    }

    if (parts.video) {
      parts.video.addEventListener('click', function () {
        startPlayer(box);
      });
    }
  });
})();
