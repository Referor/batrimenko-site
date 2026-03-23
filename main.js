function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    const update = () => {
        header.classList.toggle('scrolled', window.scrollY > 0);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
}

function initHover() {
    document.querySelectorAll('.js_hover').forEach(button => {
        const text = button.textContent.trim().replace(/\s+/g, '\u00A0');
        button.innerHTML = '<span>' + text.split('').join('</span><span>') + '</span>';
        button.querySelectorAll(':scope > span').forEach((span, i) => {
            span.style.transitionDelay = `calc(${i} * var(--delay))`;
        });
    });
}

function initMenu() {
    const trigger = document.querySelector('.menu-trigger');
    const menu = document.querySelector('.menu');

    if (!trigger || !menu) return;

    const spanOpen = trigger.querySelector('.to-open');
    const spanClose = trigger.querySelector('.to-close');

    function setWidthVars() {
        trigger.style.setProperty('--width1', spanOpen.offsetWidth + 'px');
        trigger.style.setProperty('--width2', spanClose.offsetWidth + 'px');
    }

    function setMenuState(open) {
        trigger.setAttribute('aria-expanded', open);
        menu.setAttribute('aria-hidden', !open);
        menu.setAttribute('data-open', open);
    }

    document.fonts.ready.then(setWidthVars);

    new ResizeObserver(setWidthVars).observe(document.documentElement);

    trigger.addEventListener('click', () => {
        setMenuState(trigger.getAttribute('aria-expanded') !== 'true');
    });

    menu.addEventListener('click', (e) => {
        if (e.target.closest('a[href^="#"]')) setMenuState(false);
    });
}

function initSplit(container) {
    container.querySelectorAll('.js_split').forEach(el => {
        const words = el.textContent.trim().split(' ').filter(Boolean);
        el.innerHTML = words
            .map(word => `<span><span>${word}</span> </span>`)
            .join('');
    });
}

function calcSplitDelays(container) {
    let lineOffset = 0;

    container.querySelectorAll('.js_split').forEach(el => {
        const outerSpans = el.querySelectorAll(':scope > span');
        const lineMap = new Map();

        outerSpans.forEach(span => {
            const top = Math.round(span.offsetTop);
            if (!lineMap.has(top)) lineMap.set(top, []);
            lineMap.get(top).push(span);
        });

        const lines = [...lineMap.values()];

        lines.forEach((lineSpans, i) => {
            lineSpans.forEach(span => {
                span.querySelector('span').style.transitionDelay =
                    `calc(${lineOffset + i} * var(--delay))`;
            });
        });

        lineOffset += lines.length;
    });
}

function initDetectScroll() {
    const containers = document.querySelectorAll('.js_detectScroll');
    if (!containers.length) return;

    containers.forEach(container => {
        initSplit(container);
    });

    document.fonts.ready.then(() => {
        const resizeObserver = new ResizeObserver(debounce(entries => {
            entries.forEach(entry => calcSplitDelays(entry.target));
        }, 150));

        containers.forEach(container => {
            const initObserver = new ResizeObserver(() => {
                calcSplitDelays(container);
                initObserver.disconnect();
                resizeObserver.observe(container);
            });
            initObserver.observe(container);
        });
    });

    function checkVisibility() {
        containers.forEach(container => {
            if (container.dataset.visible) return;
            const rect = container.getBoundingClientRect();
            if (rect.top <= window.innerHeight * 3 / 4) {
                container.classList.add('visible');
                container.dataset.visible = '1';
            }
        });
    }

    window.addEventListener('scroll', checkVisibility, { passive: true });
    checkVisibility();
}

function debounce(fn, ms) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), ms);
    };
}

function initSliderHero() {
    const el = document.querySelector('.slider-hero');
    if (!el) return;

    let swiper = null;

    function initSwiper() {
        swiper = new Swiper(el, {
            speed: 400,
            slidesPerView: 'auto',
            pagination: {
                el: el.querySelector('.swiper-pagination'),
                clickable: true,
            },
        });
    }

    function destroySwiper() {
        if (swiper) {
            swiper.destroy(true, true);
            swiper = null;
        }
    }

    function handleResize() {
        if (window.innerWidth <= 767) {
            if (!swiper) initSwiper();
        } else {
            destroySwiper();
        }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
}

function initSliderAbout() {
    const els = document.querySelectorAll('.slider-about');
    if (!els.length) return;

    els.forEach(el => {
        let swiper = null;

        function initSwiper() {
            swiper = new Swiper(el, {
                speed: 400,
                slidesPerView: 'auto',
            });
        }

        function destroySwiper() {
            if (swiper) {
                swiper.destroy(true, true);
                swiper = null;
            }
        }

        function handleResize() {
            if (window.innerWidth <= 1099) {
                if (!swiper) initSwiper();
            } else {
                destroySwiper();
            }
        }

        handleResize();
        window.addEventListener('resize', handleResize);
    });
}

function initSliderCompetencies() {
    const els = document.querySelectorAll('.slider-competencies');
    if (!els.length) return;

    els.forEach(el => {
        let swiper = null;

        function initSwiper() {
            swiper = new Swiper(el, {
                speed: 400,
                slidesPerView: 'auto',
            });
        }

        function destroySwiper() {
            if (swiper) {
                swiper.destroy(true, true);
                swiper = null;
            }
        }

        function handleResize() {
            if (window.innerWidth <= 1023) {
                if (!swiper) initSwiper();
            } else {
                destroySwiper();
            }
        }

        handleResize();
        window.addEventListener('resize', handleResize);
    });
}

function initSliderEvents() {
    document.querySelectorAll('.slider-events').forEach((el) => {
        new Swiper(el, {
            speed: 400,
            slidesPerView: 'auto',
            loop: true,
            navigation: {
                prevEl: el.querySelector('.slider-events-prev'),
                nextEl: el.querySelector('.slider-events-next'),
            },
        });
    });
}

function initPractice() {
    const practice = document.querySelector('.practice');
    if (!practice) return;

    const screen = practice.querySelector('.screen');
    const list = practice.querySelector('.list');
    const items = Array.from(list.querySelectorAll('li'));
    const count = items.length;

    // Какую долю слота занимает движение (остаток — пауза в начале)
    const overlap = 0.6;

    function getEasedPercent(rawPercent) {
        // rawPercent: глобальный прогресс от 0 до count
        // Для каждого li свой слот шириной 1
        // Структура слота: [пауза (1-overlap)] [движение (overlap)]
        const slot = Math.floor(rawPercent);
        const slotProgress = rawPercent - slot; // 0..1 внутри слота

        const pauseEnd = 1 - overlap;
        let eased;

        if (slotProgress < pauseEnd) {
            eased = 0;
        } else {
            eased = (slotProgress - pauseEnd) / overlap;
        }

        return slot + eased;
    }

    function getOpacity(easedPercent, index) {
        const distance = index - easedPercent;

        if (distance < 0) {
            // Уехавшие вверх
            const d = Math.abs(distance);
            if (d < 1) return 1 - 0.7 * d;         // 1 → 0.3
            if (d < 2) return 0.3 - 0.3 * (d - 1);  // 0.3 → 0
            return 0;
        } else {
            // Ещё не ставшие активными
            if (distance < 1) return 0.3 + 0.7 * (1 - distance); // 0.3 → 1
            if (distance < 2) return 0.3 * (2 - distance);        // 0.3 → 0
            return 0;
        }
    }

    function getProgressImg(easedPercent, index) {
        const distance = Math.abs(index - easedPercent);
        if (distance >= 1) return 0;
        return Math.round(1 - distance);
    }

    function onScroll() {
        const screenRect = screen.getBoundingClientRect();
        const screenHeight = screen.offsetHeight;
        const wh = window.innerHeight;

        // 0: верх screen у нижней границы вьюпорта
        // 1: низ screen у нижней границы вьюпорта
        const rawProgress = (wh - screenRect.top) / screenHeight;
        const progress = Math.min(1, Math.max(0, rawProgress));

        // Глобальный прогресс от 0 до (count - 1)
        const rawPercent = progress * (count - 1);
        const easedPercent = getEasedPercent(rawPercent);

        list.style.setProperty('--percent', easedPercent);

        items.forEach((li, index) => {
            li.style.setProperty('--opacity', getOpacity(easedPercent, index));
            li.style.setProperty('--progressImg', getProgressImg(easedPercent, index));
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

var initSubscrCover = function () {
    var links = document.querySelectorAll('.subscr-cover-link');

    document.fonts.ready.then(function () {
        links.forEach(function (el) {
            var btn = el.querySelector('.btn');
            el.style.setProperty('--width', btn.offsetWidth + 'px');
        });
    });

    var _scroll = function () {
        var scrolled = window.scrollY > window.innerHeight;
        links.forEach(function (el) {
            el.classList.toggle('scrolled', scrolled);
        });
    };

    window.addEventListener('scroll', _scroll);
    _scroll();
};

function initVideos() {
    const videos = document.querySelectorAll('video[autoplay]');
    if (!videos.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const video = entry.target;
            if (entry.isIntersecting) {
                video.play();
            } else {
                video.pause();
            }
        });
    }, {
        threshold: 0.1
    });

    videos.forEach((video) => observer.observe(video));
}

document.addEventListener("DOMContentLoaded", function () {
    initHeaderScroll();
    initHover();
    initMenu();
    initSliderHero();
    initSliderAbout();
    initSliderCompetencies();
    initSliderEvents();
    initPractice();
    initDetectScroll();
    initSubscrCover();
    initVideos();
});