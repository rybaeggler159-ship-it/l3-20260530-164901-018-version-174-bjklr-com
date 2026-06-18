// Full-site client-side search over the static movie index.
(function () {
  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function card(movie) {
    return '' +
      '<article class="movie-card">' +
      '<a href="' + escapeHtml(movie.url) + '">' +
      '<div class="poster-wrap">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<div class="poster-mask"></div>' +
      '<div class="year-badge">' + escapeHtml(movie.year) + '</div>' +
      '<div class="play-hover">立即播放</div>' +
      '</div>' +
      '<h3>' + escapeHtml(movie.title) + '</h3>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><em>' + escapeHtml(movie.type) + '</em></div>' +
      '</a>' +
      '</article>';
  }

  function match(movie, query) {
    if (!query) {
      return true;
    }
    var text = [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.oneLine,
      movie.summary,
      movie.category,
      (movie.tags || []).join(' ')
    ].join(' ').toLowerCase();
    return text.indexOf(query.toLowerCase()) !== -1;
  }

  function render() {
    var data = window.MOVIE_SEARCH_DATA || [];
    var form = document.querySelector('[data-global-search-form]');
    var input = document.querySelector('[data-global-search-input]');
    var result = document.querySelector('[data-global-search-result]');
    var status = document.querySelector('[data-global-search-status]');
    var q = getQuery();

    if (input) {
      input.value = q;
    }

    function draw(query) {
      var normalized = query.trim();
      var items = data.filter(function (movie) {
        return match(movie, normalized);
      }).slice(0, 240);
      if (status) {
        status.textContent = normalized ? '搜索“' + normalized + '”，显示 ' + items.length + ' 条结果' : '显示最新收录的 ' + items.length + ' 部影片';
      }
      if (result) {
        result.innerHTML = items.map(card).join('') || '<div class="empty-state is-visible">没有找到匹配影片，请尝试更换关键词。</div>';
      }
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = input ? input.value.trim() : '';
        var url = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
        window.history.replaceState(null, '', url);
        draw(value);
      });
    }
    if (input) {
      input.addEventListener('input', function () {
        draw(input.value);
      });
    }
    draw(q);
  }

  if (document.readyState !== 'loading') {
    render();
  } else {
    document.addEventListener('DOMContentLoaded', render);
  }
})();
