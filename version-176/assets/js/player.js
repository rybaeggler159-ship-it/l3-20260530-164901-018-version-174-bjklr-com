// HLS player bootstrap. Each detail page binds its movie to one real m3u8 source.
(function () {
  var sources = [
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e398cb38b257828eeedbcaa0ae2856da/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/77ae15566dde5cfb920bae4712a38399/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/41cb67b47a3668efaea014219666e659/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/31227358d3c181b7168e28ad248cfb4e/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/d0af4221b8947fda8c23f4955947cb58/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e70b98acb53eb889d108057988609efb/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/86ea18f9954dbaf22eff5e16c41b4a25/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/2df81e778442675885257ce3e84c7173/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/af3d3f3b4940cee04efcd8ff2c9eef0a/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/60b4ddb3d166e1239abfc7adf611a6a3/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/a27121d514ff0079e1e81a6678f14e0c/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/f0d38b8679a1231eff816a8e04cc1a0c/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/c66b5309b3b64d15ed856810d6cc0b72/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/c99d86ece73a935b77e57d322461ddb5/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/fe0c41d994d01211debb24e84e3384a9/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/929fdb8e536c1fc43a83b32d1a838547/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/fbc04ae173a0e633458658e80ee78c2a/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/0ba4f146b0e6ea192526706f495d460f/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/1e53f0e1aef7ec2fb5f30ef5d309d69c/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/1116997bf50b78f22bbfaced8975a021/manifest/video.m3u8"
];
  var activeHls = null;

  function destroyHls() {
    if (activeHls) {
      activeHls.destroy();
      activeHls = null;
    }
  }

  function playSource(video, sourceUrl) {
    if (!video || !sourceUrl) {
      return;
    }
    destroyHls();

    if (window.Hls && window.Hls.isSupported()) {
      activeHls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      activeHls.loadSource(sourceUrl);
      activeHls.attachMedia(video);
      activeHls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      activeHls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          destroyHls();
          video.src = sourceUrl;
          video.play().catch(function () {});
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {});
      }, { once: true });
    } else {
      video.src = sourceUrl;
      video.play().catch(function () {});
    }
  }

  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  ready(function () {
    var player = document.querySelector('[data-player]');
    if (!player) {
      return;
    }
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-player-overlay]');
    var buttons = Array.prototype.slice.call(player.querySelectorAll('[data-source-index]'));
    var defaultIndex = Number(player.getAttribute('data-default-source') || 0) % sources.length;

    function activate(index) {
      var normalized = ((Number(index) || 0) % sources.length + sources.length) % sources.length;
      var sourceUrl = sources[normalized];
      buttons.forEach(function (button) {
        button.classList.toggle('is-active', Number(button.getAttribute('data-source-index')) === normalized);
      });
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      playSource(video, sourceUrl);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activate(button.getAttribute('data-source-index'));
      });
    });

    var playButton = player.querySelector('[data-play-default]');
    if (playButton) {
      playButton.addEventListener('click', function () {
        activate(defaultIndex);
      });
    }
  });
})();
