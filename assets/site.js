(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var filterForm = document.querySelector('[data-filter-form]');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));

  function normalize(text) {
    return String(text || '').trim().toLowerCase();
  }

  function updateFilters() {
    if (!filterForm || !filterCards.length) {
      return;
    }

    var keyword = normalize(filterForm.querySelector('[name="q"]').value);
    var type = normalize(filterForm.querySelector('[name="type"]').value);
    var category = normalize(filterForm.querySelector('[name="category"]').value);
    var visibleCount = 0;

    filterCards.forEach(function (card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.type,
        card.dataset.category,
        card.dataset.tags
      ].join(' '));
      var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchesType = !type || normalize(card.dataset.type).indexOf(type) !== -1;
      var matchesCategory = !category || normalize(card.dataset.category) === category;
      var visible = matchesKeyword && matchesType && matchesCategory;

      card.style.display = visible ? '' : 'none';

      if (visible) {
        visibleCount += 1;
      }
    });

    document.body.classList.toggle('has-empty-result', visibleCount === 0);
  }

  if (filterForm) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && filterForm.querySelector('[name="q"]')) {
      filterForm.querySelector('[name="q"]').value = q;
    }

    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      updateFilters();
    });

    filterForm.addEventListener('input', updateFilters);
    filterForm.addEventListener('change', updateFilters);
    updateFilters();
  }

  var playerButton = document.querySelector('[data-player-button]');
  var playerVideo = document.querySelector('[data-player-video]');
  var playerBox = document.querySelector('[data-player-box]');

  function loadVideo(source) {
    if (!playerVideo || !source) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(playerVideo);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        playerVideo.play();
      });
    } else if (playerVideo.canPlayType('application/vnd.apple.mpegurl')) {
      playerVideo.src = source;
      playerVideo.addEventListener('loadedmetadata', function () {
        playerVideo.play();
      }, { once: true });
    } else {
      playerVideo.src = source;
      playerVideo.play();
    }

    if (playerBox) {
      playerBox.classList.add('playing');
    }
  }

  if (playerButton && playerVideo) {
    playerButton.addEventListener('click', function () {
      loadVideo(playerButton.dataset.source);
    });
  }
})();
