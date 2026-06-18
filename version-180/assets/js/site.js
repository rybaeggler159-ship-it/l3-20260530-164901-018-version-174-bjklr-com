(function() {
    var menuButton = document.querySelector(".js-menu-button");
    var mobilePanel = document.querySelector(".js-mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function() {
            mobilePanel.classList.toggle("open");
        });
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupHero(carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var controls = Array.prototype.slice.call(carousel.querySelectorAll(".hero-control"));
        var index = 0;
        var timer = null;

        if (!slides.length) {
            return;
        }

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        controls.forEach(function(button) {
            button.addEventListener("click", function() {
                var dir = Number(button.getAttribute("data-dir") || 1);
                show(index + dir);
                start();
            });
        });

        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                show(Number(dot.getAttribute("data-slide") || 0));
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    document.querySelectorAll(".js-hero-carousel").forEach(setupHero);

    function setupFilters(scope) {
        var textInput = scope.querySelector(".js-filter-text");
        var typeSelect = scope.querySelector(".js-filter-type");
        var yearSelect = scope.querySelector(".js-filter-year");
        var clearButton = scope.querySelector(".js-clear-filters");
        var countLabel = scope.querySelector(".js-filter-count");
        var noResults = scope.querySelector(".js-no-results");
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

        if (!cards.length) {
            return;
        }

        function apply() {
            var term = normalize(textInput && textInput.value);
            var type = normalize(typeSelect && typeSelect.value);
            var year = normalize(yearSelect && yearSelect.value);
            var visible = 0;

            cards.forEach(function(card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var matchTerm = !term || haystack.indexOf(term) !== -1;
                var matchType = !type || normalize(card.getAttribute("data-type")) === type;
                var matchYear = !year || normalize(card.getAttribute("data-year")) === year;
                var isVisible = matchTerm && matchType && matchYear;

                card.classList.toggle("hidden-by-filter", !isVisible);
                if (isVisible) {
                    visible += 1;
                }
            });

            if (countLabel) {
                countLabel.textContent = visible > 0 ? "筛选结果已更新" : "暂无匹配影片";
            }

            if (noResults) {
                noResults.classList.toggle("show", visible === 0);
            }
        }

        [textInput, typeSelect, yearSelect].forEach(function(control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        if (clearButton) {
            clearButton.addEventListener("click", function() {
                if (textInput) {
                    textInput.value = "";
                }
                if (typeSelect) {
                    typeSelect.value = "";
                }
                if (yearSelect) {
                    yearSelect.value = "";
                }
                apply();
            });
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || params.get("search");
        if (query && textInput) {
            textInput.value = query;
        }
        apply();
    }

    document.querySelectorAll(".js-listing-scope").forEach(setupFilters);

    document.querySelectorAll(".js-search-form").forEach(function(form) {
        form.addEventListener("submit", function(event) {
            var input = form.querySelector(".js-search-input");
            var value = input ? input.value.trim() : "";
            var localFilter = document.querySelector(".js-filter-text");

            if (localFilter && value) {
                event.preventDefault();
                localFilter.value = value;
                localFilter.dispatchEvent(new Event("input", { bubbles: true }));
                window.scrollTo({
                    top: Math.max(0, localFilter.getBoundingClientRect().top + window.scrollY - 110),
                    behavior: "smooth"
                });
            }
        });
    });

    var hlsLoadingPromise = null;

    function loadHlsScript() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsLoadingPromise) {
            return hlsLoadingPromise;
        }

        hlsLoadingPromise = new Promise(function(resolve, reject) {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
            script.async = true;
            script.onload = function() {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });

        return hlsLoadingPromise;
    }

    function setupPlayer(shell) {
        var video = shell.querySelector("video");
        var button = shell.querySelector(".player-button");
        var status = shell.querySelector(".player-status");
        var source = shell.getAttribute("data-src");
        var hlsInstance = null;
        var started = false;

        if (!video || !button || !source) {
            return;
        }

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function attachSource() {
            if (started) {
                return Promise.resolve();
            }

            started = true;
            setStatus("正在连接高清播放源");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return Promise.resolve();
            }

            return loadHlsScript().then(function(Hls) {
                if (Hls && Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
                        setStatus("播放源已就绪");
                    });
                    hlsInstance.on(Hls.Events.ERROR, function(event, data) {
                        if (data && data.fatal) {
                            setStatus("播放遇到错误，正在尝试恢复");
                            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                                hlsInstance.startLoad();
                            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                                hlsInstance.recoverMediaError();
                            }
                        }
                    });
                } else {
                    video.src = source;
                }
            }).catch(function() {
                video.src = source;
            });
        }

        function play() {
            attachSource().then(function() {
                video.controls = true;
                var playPromise = video.play();
                if (playPromise && typeof playPromise.then === "function") {
                    playPromise.then(function() {
                        shell.classList.add("is-playing");
                    }).catch(function() {
                        setStatus("点击视频区域继续播放");
                    });
                } else {
                    shell.classList.add("is-playing");
                }
            });
        }

        button.addEventListener("click", play);
        shell.addEventListener("click", function(event) {
            if (event.target === button || button.contains(event.target)) {
                return;
            }
            if (!started || video.paused) {
                play();
            }
        });

        video.addEventListener("play", function() {
            shell.classList.add("is-playing");
        });

        video.addEventListener("pause", function() {
            if (!video.ended) {
                shell.classList.remove("is-playing");
            }
        });

        window.addEventListener("beforeunload", function() {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.querySelectorAll(".movie-player").forEach(setupPlayer);
})();
