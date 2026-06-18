(function () {
    function readConfig() {
        var node = document.getElementById('player-config');

        if (!node) {
            return null;
        }

        try {
            return JSON.parse(node.textContent || '{}');
        } catch (error) {
            return null;
        }
    }

    function prepareVideo(video, source) {
        if (!video || !source || video.getAttribute('data-ready') === '1') {
            return Promise.resolve();
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.setAttribute('data-ready', '1');
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(source);
            hls.attachMedia(video);
            video.hlsInstance = hls;
            video.setAttribute('data-ready', '1');

            return new Promise(function (resolve) {
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
                window.setTimeout(resolve, 1200);
            });
        }

        video.src = source;
        video.setAttribute('data-ready', '1');
        return Promise.resolve();
    }

    document.addEventListener('DOMContentLoaded', function () {
        var config = readConfig();
        var video = document.getElementById('movieVideo');
        var button = document.getElementById('playButton');

        if (!config || !video) {
            return;
        }

        if (config.poster) {
            video.poster = config.poster;
        }

        function startPlayback() {
            prepareVideo(video, config.source).then(function () {
                var request = video.play();

                if (request && typeof request.catch === 'function') {
                    request.catch(function () {});
                }
            });
        }

        if (button) {
            button.addEventListener('click', function () {
                button.classList.add('is-hidden');
                startPlayback();
            });
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                if (button) {
                    button.classList.add('is-hidden');
                }
                startPlayback();
            }
        });

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
    });
})();
