(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function move(step) {
            show(index + step);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                move(1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                move(-1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                move(1);
                restart();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });
        show(0);
        restart();
    }

    function setupSearch() {
        var panel = document.querySelector("[data-filter-panel]");
        if (!panel) {
            return;
        }
        var query = panel.querySelector("[data-filter-query]");
        var year = panel.querySelector("[data-filter-year]");
        var type = panel.querySelector("[data-filter-type]");
        var channel = panel.querySelector("[data-filter-channel]");
        var reset = panel.querySelector("[data-filter-reset]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
        var status = document.querySelector("[data-search-status]");
        var params = new URLSearchParams(window.location.search);

        if (query && params.get("q")) {
            query.value = params.get("q");
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function matchYear(cardYear, selected) {
            if (!selected) {
                return true;
            }
            var numeric = parseInt(cardYear, 10);
            if (!numeric) {
                return false;
            }
            if (selected === "2025+") {
                return numeric >= 2025;
            }
            if (selected === "2020-2024") {
                return numeric >= 2020 && numeric <= 2024;
            }
            if (selected === "2010-2019") {
                return numeric >= 2010 && numeric <= 2019;
            }
            if (selected === "2000-2009") {
                return numeric >= 2000 && numeric <= 2009;
            }
            if (selected === "before-2000") {
                return numeric < 2000;
            }
            return true;
        }

        function apply() {
            var q = normalize(query ? query.value : "");
            var y = year ? year.value : "";
            var t = type ? type.value : "";
            var c = channel ? channel.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-region"),
                    card.textContent
                ].join(" "));
                var ok = true;
                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (t && card.getAttribute("data-type") !== t) {
                    ok = false;
                }
                if (c && card.getAttribute("data-channel") !== c) {
                    ok = false;
                }
                if (!matchYear(card.getAttribute("data-year"), y)) {
                    ok = false;
                }
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });
            if (status) {
                status.textContent = "当前显示 " + visible + " 部影片";
            }
        }

        [query, year, type, channel].forEach(function (item) {
            if (item) {
                item.addEventListener("input", apply);
                item.addEventListener("change", apply);
            }
        });
        if (reset) {
            reset.addEventListener("click", function () {
                if (query) {
                    query.value = "";
                }
                if (year) {
                    year.value = "";
                }
                if (type) {
                    type.value = "";
                }
                if (channel) {
                    channel.value = "";
                }
                apply();
            });
        }
        apply();
    }

    function setupPlayer() {
        var video = document.querySelector("#movie-video");
        var button = document.querySelector("[data-play-button]");
        if (!video || !button) {
            return;
        }
        var source = video.getAttribute("data-src");
        var loaded = false;

        function bindSource() {
            if (loaded || !source) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = source;
            }
            loaded = true;
        }

        function start() {
            bindSource();
            button.classList.add("is-hidden");
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupPlayer();
    });
}());
