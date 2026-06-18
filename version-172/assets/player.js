(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    document.querySelectorAll(".js-player").forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".player-overlay");
      var src = player.getAttribute("data-src");
      var hls = null;
      var prepared = false;

      function prepare() {
        if (!video || !src || prepared) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (player.getAttribute("data-autoplay") === "1") {
              video.play().catch(function () {});
            }
          });
        } else {
          video.src = src;
        }
      }

      function start() {
        if (!video) {
          return;
        }
        player.setAttribute("data-autoplay", "1");
        prepare();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        video.play().catch(function () {});
      }

      if (overlay) {
        overlay.addEventListener("click", function (event) {
          event.preventDefault();
          start();
        });
      }

      player.addEventListener("click", function (event) {
        if (!prepared && (event.target === player || event.target === video)) {
          start();
        }
      });

      if (video) {
        video.addEventListener("play", function () {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  });
})();
