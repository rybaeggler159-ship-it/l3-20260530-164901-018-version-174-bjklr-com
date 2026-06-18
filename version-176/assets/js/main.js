// Static interaction script for navigation, hero carousel, and category filters.
(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var panel = document.querySelector('[data-mobile-menu]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
        dot.setAttribute('aria-current', dotIndex === active ? 'true' : 'false');
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupLocalFilter() {
    var filter = document.querySelector('[data-filter]');
    if (!filter) {
      return;
    }
    var keyword = filter.querySelector('[data-filter-keyword]');
    var region = filter.querySelector('[data-filter-region]');
    var type = filter.querySelector('[data-filter-type]');
    var year = filter.querySelector('[data-filter-year]');
    var reset = filter.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var status = document.querySelector('[data-filter-status]');
    var empty = document.querySelector('[data-empty-state]');

    function matchSelect(card, attr, value) {
      if (!value) {
        return true;
      }
      return String(card.getAttribute(attr) || '').indexOf(value) !== -1;
    }

    function apply() {
      var q = keyword ? keyword.value.trim().toLowerCase() : '';
      var r = region ? region.value : '';
      var t = type ? type.value : '';
      var y = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = String(card.getAttribute('data-search') || '').toLowerCase();
        var ok = (!q || text.indexOf(q) !== -1) &&
          matchSelect(card, 'data-region', r) &&
          matchSelect(card, 'data-type', t) &&
          matchSelect(card, 'data-year', y);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = '当前显示 ' + visible + ' 部 / 共 ' + cards.length + ' 部';
      }
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [keyword, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    if (reset) {
      reset.addEventListener('click', function () {
        if (keyword) keyword.value = '';
        if (region) region.value = '';
        if (type) type.value = '';
        if (year) year.value = '';
        apply();
      });
    }
    apply();
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupLocalFilter();
  });
})();
