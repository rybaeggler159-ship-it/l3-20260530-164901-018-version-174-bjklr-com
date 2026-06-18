import { H as Hls } from './hls-vendor-dru42stk.js';

function showPlayerError(container, message) {
  var errorBox = container.querySelector('[data-player-error]');
  if (errorBox) {
    errorBox.textContent = message;
  }
}

function initPlayer(container) {
  var video = container.querySelector('video[data-src]');
  var playButton = container.querySelector('[data-play-button]');
  var source = video ? video.dataset.src : '';
  var hlsInstance = null;
  var initialized = false;

  if (!video || !playButton || !source) {
    return;
  }

  function attachSource() {
    if (initialized) {
      return Promise.resolve();
    }

    initialized = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      return new Promise(function (resolve, reject) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            reject(new Error(data.details || 'HLS 播放源加载失败'));
          }
        });
      });
    }

    showPlayerError(container, '当前浏览器不支持 HLS 播放。');
    return Promise.reject(new Error('HLS is not supported'));
  }

  playButton.addEventListener('click', function () {
    playButton.classList.add('is-hidden');
    attachSource()
      .then(function () {
        return video.play();
      })
      .catch(function (error) {
        playButton.classList.remove('is-hidden');
        showPlayerError(container, error.message || '播放器初始化失败，请稍后重试。');
      });
  });

  video.addEventListener('play', function () {
    playButton.classList.add('is-hidden');
  });

  video.addEventListener('ended', function () {
    playButton.classList.remove('is-hidden');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player]').forEach(initPlayer);
});
