/**
 * Mass Quest — participation lines with tap-to-speak responses in Tiny Priest.
 */
(function initMassQuest(global) {
    const LINES = global.MASS_PARTICIPATION_LINES || [];
    const PARTS = global.MASS_LITURGY_PARTS || [];

    const state = {
        active: false,
        practiceMode: true,
        showDirections: false,
        lineIndex: 0,
        revealed: false,
        filteredLines: [],
        bound: false,
        onAssemblySpoke: null,
    };

    function tp(key, fallback) {
        return typeof global.tpCopy === "function" ? global.tpCopy(key, fallback) : fallback;
    }

    function getSeasonPreset() {
        const liturgical =
            typeof global.getLiturgicalSeason === "function"
                ? global.getLiturgicalSeason(new Date())
                : { season: "Ordinary Time" };
        const name = String(liturgical.season || "");
        if (name === "Advent" || name === "Lent") {
            return "advent-lent";
        }
        return "ordinary";
    }

    function filterLines() {
        const season = getSeasonPreset();
        let filtered =
            season === "advent-lent"
                ? LINES.filter((line) => line.skipWhen !== "advent-lent")
                : LINES.slice();
        if (!state.showDirections) {
            filtered = filtered.filter((line) => line.role !== "rubric");
        }
        state.filteredLines = filtered;
        if (state.lineIndex >= filtered.length) {
            state.lineIndex = Math.max(0, filtered.length - 1);
        }
    }

    function getSectionForMassStep(step) {
        if (!step) {
            return "intro";
        }
        const title = String(step.title || "").toLowerCase();
        if (step.partEn === "Introductory Rites") {
            return "intro";
        }
        if (step.partEn === "Liturgy of the Word") {
            return "word";
        }
        if (step.partEn === "Concluding Rites") {
            return "concluding";
        }
        if (title.includes("eucharistic prayer") || title.includes("sanctus")) {
            return "thanksgiving";
        }
        if (
            title.includes("communion") ||
            title.includes("lamb of god") ||
            title.includes("sign of peace") ||
            title.includes("lord's prayer")
        ) {
            return "communion";
        }
        if (step.partEn === "Liturgy of the Eucharist") {
            return "eucharist";
        }
        return "intro";
    }

    function sectionLabel(sectionId) {
        const part = PARTS.find((p) => p.id === sectionId);
        return part ? part.label : sectionId;
    }

    function roleLabel(role) {
        if (role === "priest") {
            return tp("mass_quest.role_priest", "Priest");
        }
        if (role === "assembly") {
            return tp("mass_quest.role_children", "Children");
        }
        return tp("mass_quest.role_direction", "Direction");
    }

    function currentLine() {
        return state.filteredLines[state.lineIndex] || null;
    }

    function responseButtonLabel(text) {
        const trimmed = String(text || "").trim();
        if (!trimmed) {
            return tp("mass_quest.say_response", "Say response");
        }
        if (trimmed.length <= 28) {
            return tp("mass_quest.say_prefix", "Say: {text}").replace("{text}", trimmed);
        }
        const short = trimmed.split(/[.!?]/)[0]?.trim() || trimmed.slice(0, 28);
        if (short.length <= 32) {
            return tp("mass_quest.say_prefix", "Say: {text}").replace("{text}", short);
        }
        return tp("mass_quest.say_response", "Say response");
    }

    function triggerRoleGesture(role) {
        if (!state.onAssemblySpoke || role !== "assembly") {
            return;
        }
        const text = String(currentLine()?.text || "").toLowerCase();
        if (text.includes("amen") || text.includes("spirit")) {
            state.onAssemblySpoke("pray");
        } else if (text.includes("mercy") || text.includes("lord")) {
            state.onAssemblySpoke("pray");
        } else {
            state.onAssemblySpoke("idle");
        }
    }

    function setPanelVisible(isVisible) {
        const panel = document.getElementById("mass-quest-panel");
        if (!panel) {
            return;
        }
        panel.classList.toggle("is-active", isVisible);
        panel.setAttribute("aria-hidden", isVisible ? "false" : "true");
    }

    function render() {
        const panel = document.getElementById("mass-quest-panel");
        if (!panel) {
            return;
        }

        const line = currentLine();
        const roleEl = document.getElementById("mass-quest-role");
        const sectionEl = document.getElementById("mass-quest-section");
        const textEl = document.getElementById("mass-quest-text");
        const actionBtn = document.getElementById("mass-quest-action");
        const progressEl = document.getElementById("mass-quest-progress");
        const toggleBtn = document.getElementById("mass-quest-toggle");

        if (!state.active || !line) {
            setPanelVisible(false);
            return;
        }

        setPanelVisible(true);

        if (toggleBtn) {
            toggleBtn.classList.add("is-active");
            toggleBtn.setAttribute("aria-pressed", "true");
        }

        if (roleEl) {
            roleEl.textContent = roleLabel(line.role);
            roleEl.className = `mass-quest-role mass-quest-role--${line.role}`;
        }
        if (sectionEl) {
            sectionEl.textContent = sectionLabel(line.section);
        }
        if (progressEl) {
            progressEl.textContent = tp("mass_quest.progress", "{current} / {total}")
                .replace("{current}", String(state.lineIndex + 1))
                .replace("{total}", String(state.filteredLines.length));
        }

        const isAssembly = line.role === "assembly";
        const hideText =
            state.practiceMode && isAssembly && line.revealable !== false && !state.revealed;

        if (textEl) {
            textEl.textContent = hideText ? "" : line.text;
            textEl.classList.toggle("mass-quest-text--hidden", hideText);
        }

        if (actionBtn) {
            if (isAssembly && line.revealable !== false) {
                actionBtn.hidden = false;
                actionBtn.className = "mass-quest-action mass-quest-action--speak";
                actionBtn.textContent = hideText
                    ? responseButtonLabel(line.text)
                    : tp("mass_quest.continue", "Continue");
            } else {
                actionBtn.hidden = false;
                actionBtn.className = "mass-quest-action mass-quest-action--continue";
                actionBtn.textContent = tp("mass_quest.continue", "Continue");
            }
        }
    }

    function advanceLine() {
        if (state.lineIndex < state.filteredLines.length - 1) {
            state.lineIndex += 1;
            state.revealed = false;
            render();
            return true;
        }
        render();
        return false;
    }

    function handleAction() {
        const line = currentLine();
        if (!line) {
            return;
        }

        if (line.role === "assembly" && line.revealable !== false) {
            if (state.practiceMode && !state.revealed) {
                state.revealed = true;
                triggerRoleGesture("assembly");
                render();
                return;
            }
            triggerRoleGesture("assembly");
            advanceLine();
            return;
        }

        advanceLine();
    }

    function jumpToSection(sectionId) {
        filterLines();
        const index = state.filteredLines.findIndex((line) => line.section === sectionId);
        state.lineIndex = index >= 0 ? index : 0;
        state.revealed = false;
        render();
    }

    function syncToMassStep(stepIndex) {
        if (!state.active) {
            return;
        }
        const steps =
            typeof global.getMassFlowSteps === "function" ? global.getMassFlowSteps() : [];
        const step = steps[stepIndex];
        jumpToSection(getSectionForMassStep(step));
    }

    function bindControls() {
        if (state.bound) {
            return;
        }
        const actionBtn = document.getElementById("mass-quest-action");
        const toggleBtn = document.getElementById("mass-quest-toggle");
        const practiceBtn = document.getElementById("mass-quest-practice");

        if (actionBtn && actionBtn.dataset.bound !== "true") {
            actionBtn.dataset.bound = "true";
            actionBtn.addEventListener("click", handleAction);
        }
        if (toggleBtn && toggleBtn.dataset.bound !== "true") {
            toggleBtn.dataset.bound = "true";
            toggleBtn.addEventListener("click", () => {
                if (state.active) {
                    global.MassQuest.stop();
                } else {
                    global.MassQuest.start();
                }
            });
        }
        if (practiceBtn && practiceBtn.dataset.bound !== "true") {
            practiceBtn.dataset.bound = "true";
            practiceBtn.addEventListener("click", () => {
                state.practiceMode = !state.practiceMode;
                practiceBtn.classList.toggle("is-active", state.practiceMode);
                practiceBtn.setAttribute("aria-pressed", state.practiceMode ? "true" : "false");
                state.revealed = false;
                render();
            });
        }
        state.bound = true;
    }

    global.MassQuest = {
        init(options = {}) {
            state.onAssemblySpoke = options.onAssemblySpoke || null;
            bindControls();
            filterLines();
        },
        start() {
            state.active = true;
            state.revealed = false;
            filterLines();
            state.lineIndex = 0;
            render();
        },
        stop() {
            state.active = false;
            state.revealed = false;
            const toggleBtn = document.getElementById("mass-quest-toggle");
            if (toggleBtn) {
                toggleBtn.classList.remove("is-active");
                toggleBtn.setAttribute("aria-pressed", "false");
            }
            setPanelVisible(false);
        },
        isActive() {
            return state.active;
        },
        syncToMassStep,
        jumpToSection,
        render,
        handleAction,
    };
})(window);
