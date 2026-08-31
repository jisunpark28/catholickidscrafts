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

    function markDone(eventId) {
        const done = getDoneSet();
        const firstTime = !done.has(eventId);
        done.add(eventId);
        saveDoneSet(done);
        renderStars();
        updateHotspotStates();
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
            btn.classList.toggle("is-done", Boolean(id && done.has(id)));
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
        if (btn) {
            btn.classList.add("is-ringing");
            window.setTimeout(() => btn.classList.remove("is-ringing"), 900);
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
        const first = markDone("mary_flowers");
        const line = first
            ? tp(
                  "courtyard.mary_done",
                  "You placed a {color} flower for Mary. She is watching over you with love.",
              ).replace("{color}", colorLabel)
            : tp(
                  "courtyard.mary_repeat",
                  "Mary smiles at your {color} flower. Thank you for visiting her corner!",
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

        try {
            if (eventId === "holy_water") {
                runHolyWaterFx();
                const first = markDone("holy_water");
                say(
                    first
                        ? tp(
                              "courtyard.holy_water_done",
                              "In the name of the Father, and of the Son, and of the Holy Spirit. Amen. Open your heart for Mass!",
                          )
                        : tp(
                              "courtyard.holy_water_repeat",
                              "Holy water reminds us that Jesus welcomes us again. Make the sign of the cross.",
                          ),
                );
            } else if (eventId === "mary_flowers") {
                showFlowerPicker();
                say(
                    tp(
                        "courtyard.mary_prompt",
                        "Pick a flower for Mary. Which color would you like to offer?",
                    ),
                );
            } else if (eventId === "bell") {
                runBellFx(btn);
                const first = markDone("bell");
                say(
                    first
                        ? tp(
                              "courtyard.bell_done",
                              "Ding! The church bell calls us: come, the family of God is gathering!",
                          )
                        : tp("courtyard.bell_repeat", "The bell rings softly again. Mass time is near!"),
                );
            } else if (eventId === "bulletin") {
                const line = await fetchBulletinLine();
                markDone("bulletin");
                say(line);
            } else if (eventId === "welcome_sign") {
                const first = markDone("welcome_sign");
                say(
                    first
                        ? tp(
                              "courtyard.welcome_done",
                              "Welcome home! This is God's house — and you belong here.",
                          )
                        : tp(
                              "courtyard.welcome_repeat",
                              "You are always welcome here. Father and Sister are glad you came!",
                          ),
                );
            } else if (eventId === "parish_bench") {
                runWaveFx(btn);
                const first = markDone("parish_bench");
                say(
                    first
                        ? tp(
                              "courtyard.bench_done",
                              "A family on the bench waves: 'Hi! Sit with us — we're going to Mass together!'",
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
        if (done.has("parish_bench")) {
            bits.push(tp("courtyard.encourage_bench", "You waved to parish friends ✓"));
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
