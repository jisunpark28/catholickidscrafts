/**
 * Courtyard of Welcome — optional fun events outside the church (entry screen).
 */
(function initCourtyardEvents(global) {
    const STORAGE_KEY = "tp_courtyard_done_v1";

    const EVENT_IDS = [
        "holy_water",
        "mary_flowers",
        "bell",
        "bulletin",
        "welcome_sign",
        "parish_bench",
    ];

    const state = {
        bound: false,
        onDialogue: null,
        isBusy: false,
        flowerPickerOpen: false,
    };

    function tp(key, fallback) {
        return typeof global.tpCopy === "function" ? global.tpCopy(key, fallback) : fallback;
    }

    function isTransitioning() {
        return Boolean(global.APP_STATE?.isTransitioning);
    }

    function say(text) {
        if (typeof state.onDialogue === "function") {
            state.onDialogue(text);
        }
    }

    function getDoneSet() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return new Set();
            }
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
                return new Set();
            }
            return new Set(parsed.filter((id) => EVENT_IDS.includes(id)));
        } catch {
            return new Set();
        }
    }

    function saveDoneSet(done) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
        } catch {
            /* ignore */
        }
    }

    function markDone(eventId, btn) {
        const done = getDoneSet();
        const firstTime = !done.has(eventId);
        done.add(eventId);
        saveDoneSet(done);
        renderStars();
        updateHotspotStates();
        if (firstTime && btn) {
            btn.classList.add("is-sparkle");
            window.setTimeout(() => btn.classList.remove("is-sparkle"), 1100);
        }
        return firstTime;
    }

    function renderStars() {
        const bar = document.getElementById("courtyard-stars");
        if (!bar) {
            return;
        }
        const done = getDoneSet();
        const total = EVENT_IDS.length;
        const count = done.size;
        bar.innerHTML = "";
        bar.setAttribute(
            "aria-label",
            tp("courtyard.stars_label", "Courtyard fun: {count} of {total} stars")
                .replace("{count}", String(count))
                .replace("{total}", String(total)),
        );
        for (let i = 0; i < total; i += 1) {
            const star = document.createElement("span");
            star.className = `courtyard-star${i < count ? " is-earned" : ""}`;
            star.textContent = i < count ? "⭐" : "☆";
            star.setAttribute("aria-hidden", "true");
            bar.appendChild(star);
        }
    }

    function updateHotspotStates() {
        const done = getDoneSet();
        document.querySelectorAll("[data-courtyard-event]").forEach((btn) => {
            const id = btn.getAttribute("data-courtyard-event");
            const found = Boolean(id && done.has(id));
            btn.classList.toggle("is-found", found);
            btn.setAttribute("aria-pressed", found ? "true" : "false");
        });
    }

    function playBellTone() {
        try {
            const AudioCtx = global.AudioContext || global.webkitAudioContext;
            if (!AudioCtx) {
                return;
            }
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(660, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.45);
            gain.gain.setValueAtTime(0.0001, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.75);
            osc.onended = () => {
                void ctx.close();
            };
        } catch {
            /* mute is fine */
        }
    }

    function runHolyWaterFx() {
        const entry = document.getElementById("entry-screen");
        if (!entry) {
            return;
        }
        entry.classList.add("is-holy-water");
        window.setTimeout(() => entry.classList.remove("is-holy-water"), 1600);
    }

    function pulseMaryHalo() {
        const mary = document.getElementById("courtyard-mary");
        if (!mary) {
            return;
        }
        mary.classList.add("is-glowing");
        window.setTimeout(() => mary.classList.remove("is-glowing"), 1800);
    }

    function runBellFx(btn) {
        const bell = btn || document.querySelector(".courtyard-find--bell");
        if (bell) {
            bell.classList.add("is-ringing");
            window.setTimeout(() => bell.classList.remove("is-ringing"), 900);
        }
        playBellTone();
    }

    function runWaveFx(btn) {
        if (!btn) {
            return;
        }
        const wave = document.createElement("span");
        wave.className = "courtyard-wave-burst";
        wave.textContent = "👋";
        btn.appendChild(wave);
        window.setTimeout(() => wave.remove(), 1100);
    }

    function hideFlowerPicker() {
        const picker = document.getElementById("courtyard-flower-picker");
        if (picker) {
            picker.hidden = true;
        }
        state.flowerPickerOpen = false;
    }

    function showFlowerPicker() {
        const picker = document.getElementById("courtyard-flower-picker");
        if (!picker) {
            return;
        }
        picker.hidden = false;
        state.flowerPickerOpen = true;
    }

    function completeMaryFlowers(colorLabel) {
        hideFlowerPicker();
        pulseMaryHalo();
        const first = markDone("mary_flowers", state.lastFindButton);
        const line = first
            ? tp(
                  "courtyard.mary_done",
                  "Beautiful! You placed a {color} flower for Mary. She is praying for you during Mass — feel her gentle hug in your heart.",
              ).replace("{color}", colorLabel)
            : tp(
                  "courtyard.mary_repeat",
                  "Mary smiles at your {color} flower. She is always happy to see you!",
              ).replace("{color}", colorLabel);
        say(line);
    }

    async function fetchBulletinLine() {
        const today = new Date();
        const key = today.toISOString().slice(0, 10);
        try {
            const res = await fetch(`/api/universalis-readings/${key}`);
            if (res.ok) {
                const data = await res.json();
                const gospel = Array.isArray(data.readings)
                    ? data.readings.find((r) => r.kind === "gospel")
                    : null;
                if (gospel?.title) {
                    return tp("courtyard.bulletin_gospel", "Today's Gospel: {title}").replace(
                        "{title}",
                        gospel.title,
                    );
                }
                if (data.liturgicalTitle) {
                    return tp("courtyard.bulletin_title", "Today we celebrate: {title}").replace(
                        "{title}",
                        data.liturgicalTitle,
                    );
                }
            }
        } catch {
            /* fallback below */
        }
        const liturgical =
            typeof global.getLiturgicalSeason === "function"
                ? global.getLiturgicalSeason(today)
                : { season: "Ordinary Time" };
        return tp(
            "courtyard.bulletin_season",
            "It is {season}. God has something special for you at Mass today!",
        ).replace("{season}", liturgical.season || "Ordinary Time");
    }

    async function runEvent(eventId, btn) {
        if (state.isBusy || isTransitioning()) {
            return;
        }
        state.isBusy = true;
        state.lastFindButton = btn || null;

        try {
            if (eventId === "holy_water") {
                runHolyWaterFx();
                const first = markDone("holy_water", btn);
                say(
                    first
                        ? tp(
                              "courtyard.holy_water_done",
                              "You found the holy water font! Dip your finger and make the sign of the cross. Splash — Jesus washes your heart clean and says, 'Welcome back!'",
                          )
                        : tp(
                              "courtyard.holy_water_repeat",
                              "Holy water is a little hello from Jesus every time you walk in. Try the sign of the cross again!",
                          ),
                );
            } else if (eventId === "mary_flowers") {
                showFlowerPicker();
                say(
                    tp(
                        "courtyard.mary_prompt",
                        "You found the flower basket! Mary loves when children bring flowers. Pick a color to offer her before Mass.",
                    ),
                );
            } else if (eventId === "bell") {
                runBellFx(btn);
                const first = markDone("bell", btn);
                say(
                    first
                        ? tp(
                              "courtyard.bell_done",
                              "You found the church bell! Ding-dong! That sound means: 'Come in, little friend — God's family is gathering, and we saved you a seat!'",
                          )
                        : tp(
                              "courtyard.bell_repeat",
                              "The bell rings again — a happy reminder that Mass is about to begin!",
                          ),
                );
            } else if (eventId === "bulletin") {
                const gospelLine = await fetchBulletinLine();
                const first = markDone("bulletin", btn);
                say(
                    first
                        ? tp(
                              "courtyard.bulletin_done",
                              "You found the bulletin board! {detail} Listen closely at Mass — God has a message just for you today.",
                          ).replace("{detail}", gospelLine)
                        : gospelLine,
                );
            } else if (eventId === "welcome_sign") {
                const first = markDone("welcome_sign", btn);
                say(
                    first
                        ? tp(
                              "courtyard.welcome_done",
                              "You found the welcome sign! It means: this is God's house, and YOU belong here. Heaven is happy you came!",
                          )
                        : tp(
                              "courtyard.welcome_repeat",
                              "The sign still smiles at you: Welcome home, every single time you visit.",
                          ),
                );
            } else if (eventId === "parish_bench") {
                runWaveFx(btn);
                const first = markDone("parish_bench", btn);
                say(
                    first
                        ? tp(
                              "courtyard.bench_done",
                              "You found the parish bench! A family waves: 'Hi! We're going to Mass too — want to sit with us? Church is better together!'",
                          )
                        : tp(
                              "courtyard.bench_repeat",
                              "Your parish friends wave again. See you inside!",
                          ),
                );
            }
        } finally {
            state.isBusy = false;
        }
    }

    function bindHotspots() {
        if (state.bound) {
            return;
        }
        document.querySelectorAll("[data-courtyard-event]").forEach((btn) => {
            if (btn.dataset.courtyardBound === "true") {
                return;
            }
            btn.dataset.courtyardBound = "true";
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const eventId = btn.getAttribute("data-courtyard-event");
                if (eventId) {
                    void runEvent(eventId, btn);
                }
            });
        });

        const picker = document.getElementById("courtyard-flower-picker");
        if (picker && picker.dataset.courtyardBound !== "true") {
            picker.dataset.courtyardBound = "true";
            picker.querySelectorAll("[data-flower-color]").forEach((choice) => {
                choice.addEventListener("click", () => {
                    const label = choice.getAttribute("data-flower-label") || choice.textContent || "";
                    completeMaryFlowers(label);
                });
            });
        }

        state.bound = true;
    }

    function getEncouragement() {
        const done = getDoneSet();
        const bits = [];
        if (done.has("mary_flowers")) {
            bits.push(tp("courtyard.encourage_mary", "You brought flowers to Mary ✓"));
        }
        if (done.has("holy_water")) {
            bits.push(tp("courtyard.encourage_water", "You used holy water ✓"));
        }
        if (done.has("bell")) {
            bits.push(tp("courtyard.encourage_bell", "You rang the welcome bell ✓"));
        }
        if (done.has("welcome_sign")) {
            bits.push(tp("courtyard.encourage_sign", "You found the welcome sign ✓"));
        }
        if (done.has("bulletin")) {
            bits.push(tp("courtyard.encourage_bulletin", "You read the bulletin ✓"));
        }
        if (done.has("parish_bench")) {
            bits.push(tp("courtyard.encourage_bench", "You found the parish family ✓"));
        }
        if (!bits.length) {
            return "";
        }
        return tp("courtyard.encourage_intro", "Before Mass:") + " " + bits.join(" ");
    }

    global.CourtyardEvents = {
        init(options = {}) {
            state.onDialogue = options.onDialogue || null;
            bindHotspots();
            renderStars();
            updateHotspotStates();
        },
        refresh() {
            renderStars();
            updateHotspotStates();
            hideFlowerPicker();
        },
        getEncouragement,
        getDoneCount() {
            return getDoneSet().size;
        },
    };
})(window);
