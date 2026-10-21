/**
 * Come to Mass! — 6 little church missions with stars + a happy ending.
 * Saved on this device (localStorage). Texts are site-copy keys (group game_tiny_priest).
 */
(function initMissions(global) {
    const STORAGE_KEY = "ctm.missions.v1";
    const MISSIONS = [
        { id: "holy_water", icon: "💧", key: "missions.holy_water", text: "Bless yourself with holy water" },
        { id: "pew", icon: "🪑", key: "missions.pew", text: "Find your pew and genuflect" },
        { id: "candle", icon: "🕯️", key: "missions.candle", text: "Light a candle for someone you love" },
        { id: "station", icon: "✝️", key: "missions.station", text: "Visit Station 1 of the Cross" },
        { id: "kneel", icon: "🙏", key: "missions.kneel", text: "Kneel at the right time during Mass" },
        { id: "responses", icon: "🗣️", key: "missions.responses", text: "Say 5 responses (“And with your spirit”…)" },
    ];
    const HINTS = {
        holy_water: ["missions.hint_holy_water", "Walk to the holy water font by the door (or tap it)."],
        pew: ["missions.hint_pew", "Walk in between the pews."],
        candle: ["missions.hint_candle", "Tap the candle stand on the left side of the church."],
        station: ["missions.hint_station", "Tap the first Station picture on the wall."],
        kneel: ["missions.hint_kneel", "Start Mass. At the Eucharistic Prayer tap “Kneel 🙏”."],
        responses: ["missions.hint_responses", "Tap “Join Responses” and say 5 answers."],
    };
    const RESPONSES_NEEDED = 5;

    const state = { done: new Set(), responses: 0, endShown: false, bound: false };

    function tp(key, fallback) {
        return typeof global.tpCopy === "function" ? global.tpCopy(key, fallback) : fallback;
    }

    function load() {
        try {
            const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
            state.done = new Set(Array.isArray(raw.done) ? raw.done : []);
            state.responses = Number(raw.responses) || 0;
        } catch {
            state.done = new Set();
            state.responses = 0;
        }
    }

    function save() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ done: [...state.done], responses: state.responses }),
            );
        } catch {
            /* private mode: keep in memory */
        }
    }

    function courtyardStars() {
        const n = global.CourtyardEvents?.getDoneCount?.();
        return Number.isFinite(n) ? Math.min(5, n) : 0;
    }

    function toast(text) {
        const el = document.getElementById("mission-toast");
        if (!el) return;
        el.textContent = text;
        el.hidden = false;
        el.classList.remove("is-show");
        void el.offsetWidth;
        el.classList.add("is-show");
        clearTimeout(toast.t);
        toast.t = setTimeout(() => {
            el.hidden = true;
        }, 2600);
    }

    function render() {
        const count = state.done.size;
        const badge = document.getElementById("missions-btn-count");
        if (badge) badge.textContent = `${count}/${MISSIONS.length}`;
        const list = document.getElementById("missions-list");
        const summary = document.getElementById("missions-summary");
        if (summary) {
            summary.textContent = tp("missions.summary", "{done} of {total} done · tap a mission to see where to go")
                .replace("{done}", String(count))
                .replace("{total}", String(MISSIONS.length));
        }
        if (!list) return;
        list.innerHTML = "";
        MISSIONS.forEach((m) => {
            const li = document.createElement("li");
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "mission-item" + (state.done.has(m.id) ? " is-done" : "");
            btn.dataset.mission = m.id;
            const label =
                m.id === "responses" && !state.done.has(m.id) && state.responses > 0
                    ? `${tp(m.key, m.text)} (${Math.min(state.responses, RESPONSES_NEEDED)}/${RESPONSES_NEEDED})`
                    : tp(m.key, m.text);
            btn.innerHTML = `<span class="mission-icon" aria-hidden="true"></span><span class="mission-text"></span><span class="mission-star" aria-hidden="true"></span>`;
            btn.querySelector(".mission-icon").textContent = m.icon;
            btn.querySelector(".mission-text").textContent = label;
            btn.querySelector(".mission-star").textContent = state.done.has(m.id) ? "⭐" : "☆";
            btn.setAttribute("aria-label", `${label}${state.done.has(m.id) ? " — done" : ""}`);
            const hint = document.createElement("p");
            hint.className = "mission-hint";
            hint.hidden = true;
            hint.textContent = tp(HINTS[m.id][0], HINTS[m.id][1]);
            li.append(btn, hint);
            list.appendChild(li);
        });
    }

    function setCardOpen(open) {
        const card = document.getElementById("missions-card");
        const btn = document.getElementById("missions-btn");
        if (!card) return;
        card.hidden = !open;
        if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
    }

    function complete(id) {
        if (!MISSIONS.some((m) => m.id === id) || state.done.has(id)) {
            return false;
        }
        state.done.add(id);
        save();
        render();
        const m = MISSIONS.find((x) => x.id === id);
        toast(`⭐ ${tp(m.key, m.text)}!`);
        const btn = document.getElementById("missions-btn");
        if (btn) {
            btn.classList.remove("is-bump");
            void btn.offsetWidth;
            btn.classList.add("is-bump");
        }
        if (state.done.size === MISSIONS.length) {
            setTimeout(() => showEnd(), 1400);
        }
        return true;
    }

    function addResponse() {
        if (state.done.has("responses")) return;
        state.responses += 1;
        save();
        if (state.responses >= RESPONSES_NEEDED) {
            complete("responses");
        } else {
            render();
        }
    }

    function setKneelVisible(visible) {
        const btn = document.getElementById("kneel-btn");
        if (btn) btn.hidden = !visible || state.done.has("kneel");
    }

    function onMassStep(title) {
        const t = String(title || "");
        setKneelVisible(/Eucharistic Prayer|Elevation/i.test(t));
        if (/Dismissal/i.test(t)) {
            setTimeout(() => showEnd(), 2500);
        }
    }

    function showEnd() {
        if (state.endShown) return;
        const end = document.getElementById("mass-end");
        if (!end) return;
        state.endShown = true;
        const total = 5 + MISSIONS.length;
        const stars = courtyardStars() + state.done.size;
        const starsEl = document.getElementById("mass-end-stars");
        if (starsEl) {
            starsEl.textContent = tp("missions.end_stars", "{stars} of {total} stars")
                .replace("{stars}", String(stars))
                .replace("{total}", String(total));
        }
        end.hidden = false;
        setCardOpen(false);
    }

    function reset() {
        state.done = new Set();
        state.responses = 0;
        state.endShown = false;
        save();
        render();
    }

    function bind() {
        if (state.bound) return;
        state.bound = true;
        document.getElementById("missions-btn")?.addEventListener("click", () => {
            const card = document.getElementById("missions-card");
            setCardOpen(card ? card.hidden : true);
        });
        document.getElementById("missions-close")?.addEventListener("click", () => setCardOpen(false));
        document.getElementById("missions-reset")?.addEventListener("click", (e) => {
            e.preventDefault();
            reset();
        });
        document.getElementById("missions-list")?.addEventListener("click", (e) => {
            const item = e.target.closest(".mission-item");
            if (!item) return;
            const hint = item.parentElement.querySelector(".mission-hint");
            if (hint) hint.hidden = !hint.hidden;
        });
        document.getElementById("kneel-btn")?.addEventListener("click", () => {
            if (typeof global.onKneelTapped === "function") global.onKneelTapped();
            complete("kneel");
            setKneelVisible(false);
        });
        document.getElementById("mass-end-again")?.addEventListener("click", () => {
            reset();
            document.getElementById("mass-end").hidden = true;
        });
        document.getElementById("mass-end-close")?.addEventListener("click", () => {
            document.getElementById("mass-end").hidden = true;
        });
        global.addEventListener("ctm:mass-step", (e) => onMassStep(e.detail?.title));
        global.addEventListener("ctm:response", () => addResponse());
        global.addEventListener("ctm:mission", (e) => complete(e.detail?.id));
    }

    function applyCopy() {
        const set = (id, key, fallback) => {
            const el = document.getElementById(id);
            if (el) el.textContent = tp(key, fallback);
        };
        set("missions-title", "missions.title", "⭐ My church missions");
        set("missions-reset", "missions.reset", "Start again");
        set("kneel-btn", "missions.kneel_btn", "Kneel 🙏");
        set("mass-end-title", "missions.end_title", "You came to Mass!");
        set("mass-end-body", "missions.end_body", "Jesus was so happy to have you here today. Thank you for praying with God's family.");
        set("mass-end-peace", "missions.end_peace", "“Go in peace!” Take Jesus' love home with you.");
        set("mass-end-again", "missions.play_again", "Play again");
    }

    global.Missions = {
        init() {
            load();
            applyCopy();
            bind();
            render();
        },
        complete,
        addResponse,
        isDone: (id) => state.done.has(id),
        showEnd,
        reset,
        setVisible(visible) {
            const btn = document.getElementById("missions-btn");
            if (btn) btn.hidden = !visible;
            if (!visible) {
                setCardOpen(false);
                setKneelVisible(false);
            }
        },
    };
})(window);
