(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-site-nav]');

  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var liveSearch = document.querySelector('[data-live-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));

  function applySearch(value) {
    var query = String(value || '').trim().toLowerCase();
    cards.forEach(function (card) {
      var text = card.getAttribute('data-filter') || '';
      card.hidden = query && text.indexOf(query) === -1;
    });
  }

  if (liveSearch && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (initial) {
      liveSearch.value = initial;
      applySearch(initial);
    }
    liveSearch.addEventListener('input', function () {
      applySearch(liveSearch.value);
    });
  }
}());
