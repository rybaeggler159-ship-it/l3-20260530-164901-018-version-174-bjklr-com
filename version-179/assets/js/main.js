(function () {
  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function escapeHTML(value) {
    return String(value || '').replace(/[&<>'"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[char];
    });
  }

  function rootPath() {
    return document.body.dataset.root || './';
  }

  function initMobileMenu() {
    var toggle = document.querySelector('.mobile-menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function sortCards(cards, mode) {
    var list = cards.slice();
    if (mode === 'year-desc') {
      list.sort(function (a, b) {
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      });
    }
    if (mode === 'year-asc') {
      list.sort(function (a, b) {
        return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
      });
    }
    if (mode === 'title-asc') {
      list.sort(function (a, b) {
        return normalize(a.textContent).localeCompare(normalize(b.textContent), 'zh-Hans-CN');
      });
    }
    return list;
  }

  function initFilterToolbar() {
    var toolbar = document.querySelector('[data-filter-toolbar]');
    var list = document.querySelector('[data-filter-list]');
    if (!toolbar || !list) {
      return;
    }

    var input = toolbar.querySelector('[data-filter-input]');
    var sortSelect = toolbar.querySelector('[data-sort-select]');
    var count = toolbar.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));

    function applyFilters() {
      var query = normalize(input ? input.value : '');
      var visibleCount = 0;
      var sorted = sortCards(cards, sortSelect ? sortSelect.value : 'default');

      sorted.forEach(function (card) {
        list.appendChild(card);
        var searchText = normalize(card.dataset.search || card.textContent);
        var isVisible = !query || searchText.indexOf(query) !== -1;
        card.classList.toggle('is-hidden-by-filter', !isVisible);
        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (count) {
        count.textContent = '显示 ' + visibleCount + ' / ' + cards.length + ' 部';
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', applyFilters);
    }
    applyFilters();
  }

  function movieCardTemplate(movie) {
    var root = rootPath();
    return '' +
      '<a class="movie-card movie-card--compact hover-lift" href="' + root + 'video/' + escapeHTML(movie.id) + '.html">' +
      '  <figure class="movie-poster">' +
      '    <img src="' + root + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy">' +
      '    <span class="movie-badge">' + escapeHTML(movie.type) + '</span>' +
      '    <span class="play-bubble">▶</span>' +
      '  </figure>' +
      '  <div class="movie-info">' +
      '    <h3>' + escapeHTML(movie.title) + '</h3>' +
      '    <p>' + escapeHTML(movie.one_line) + '</p>' +
      '    <div class="movie-meta">' +
      '      <span>' + escapeHTML(movie.region) + '</span>' +
      '      <span>·</span>' +
      '      <span>' + escapeHTML(movie.year) + '</span>' +
      '    </div>' +
      '    <div class="movie-genre">' + escapeHTML(movie.genre) + '</div>' +
      '  </div>' +
      '</a>';
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var input = document.querySelector('[data-search-page-input]');
    var status = document.querySelector('[data-search-status]');
    if (!results || !input || !window.MOVIE_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q') || '';
    input.value = queryFromUrl;

    function render() {
      var query = normalize(input.value);
      if (!query) {
        var starter = window.MOVIE_INDEX.slice(0, 12);
        results.innerHTML = starter.map(movieCardTemplate).join('');
        status.textContent = '输入关键词后显示匹配结果。当前展示前 12 部推荐内容。';
        return;
      }

      var words = query.split(/\s+/).filter(Boolean);
      var matched = window.MOVIE_INDEX.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.one_line
        ].join(' '));
        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      }).slice(0, 200);

      results.innerHTML = matched.map(movieCardTemplate).join('');
      status.textContent = '关键词“' + input.value + '”找到 ' + matched.length + ' 条结果，最多显示前 200 条。';
    }

    input.addEventListener('input', render);
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initFilterToolbar();
    initSearchPage();
  });
}());
