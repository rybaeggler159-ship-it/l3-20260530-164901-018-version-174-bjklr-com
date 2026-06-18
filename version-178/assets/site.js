(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

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

        function startSlider() {
            if (slides.length < 2) {
                return;
            }

            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startSlider();
            });
        });

        startSlider();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilters(scope) {
        var input = scope.querySelector('[data-search-input]');
        var activeButton = scope.querySelector('[data-filter-button].is-active');
        var keyword = normalize(input ? input.value : '');
        var filter = activeButton ? normalize(activeButton.getAttribute('data-filter-value')) : 'all';
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-tags')
            ].join(' '));
            var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
            var filterMatched = filter === 'all' || haystack.indexOf(filter) !== -1;

            card.classList.toggle('is-hidden', !(keywordMatched && filterMatched));
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
        var input = scope.querySelector('[data-search-input]');
        var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-button]'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (input && query) {
            input.value = query;
        }

        if (input) {
            input.addEventListener('input', function () {
                applyFilters(scope);
            });
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                buttons.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                button.classList.add('is-active');
                applyFilters(scope);
            });
        });

        applyFilters(scope);
    });
})();
