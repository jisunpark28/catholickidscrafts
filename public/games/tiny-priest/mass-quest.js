/**
 * Mass Quest — participation lines aligned to Mass Order (24 steps).
 */
(function initMassQuest(global) {
    const LINES = global.MASS_PARTICIPATION_LINES || [];
    const PARTS = global.MASS_LITURGY_PARTS || [];
    const ANCHORS = global.MASS_ORDER_QUEST_ANCHORS || [];
    const STEP_COUNT = ANCHORS.length || 24;

    const state = {
        active: false,
        practiceMode: true,
        showDirections: false,
        lineIndex: 0,
        massStepIndex: 0,
        revealed: false,
        filteredLines: [],
        bound: false,
        onAssemblySpoke: null,
        onMassStepChange: null,
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

    function resolveAnchorIndex(anchorId) {
        const fullIndex = LINES.findIndex((line) => line.id === anchorId);
        if (fullIndex < 0 || state.filteredLines.length === 0) {
            return 0;
        }
        for (let i = 0; i < state.filteredLines.length; i++) {
            const line = state.filteredLines[i];
            const idx = LINES.findIndex((entry) => entry.id === line.id);
            if (idx >= fullIndex) {
                return i;
            }
        }
        return state.filteredLines.length - 1;
    }

    function getStepBounds(stepIndex) {
        const anchorId = ANCHORS[stepIndex] || ANCHORS[0];
        const start = resolveAnchorIndex(anchorId);
        let end = state.filteredLines.length - 1;
        const nextAnchorId = ANCHORS[stepIndex + 1];
        if (nextAnchorId) {
            const nextStart = resolveAnchorIndex(nextAnchorId);
            if (nextStart > start) {
                end = nextStart - 1;
            }
        }
        return { start, end: Math.max(start, end) };
    }

    function getMassStepTitle(stepIndex) {
        const steps =
            typeof global.getMassFlowSteps === "function" ? global.getMassFlowSteps() : [];
        const step = steps[stepIndex];
        return step ? String(step.title || "") : "";
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

    function notifyMassStepChange(stepIndex) {
        if (typeof state.onMassStepChange === "function") {
            state.onMassStepChange(stepIndex);
        }
    }

    function jumpToMassStep(stepIndex, options = {}) {
        filterLines();
        const safeStep = Math.max(0, Math.min(STEP_COUNT - 1, Number(stepIndex) || 0));
        const bounds = getStepBounds(safeStep);
        state.massStepIndex = safeStep;
        state.lineIndex = bounds.start;
        state.revealed = false;
        if (options.notify !== false) {
            notifyMassStepChange(safeStep);
        }
        render();
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

        const stepTitle = getMassStepTitle(state.massStepIndex);
        const bounds = getStepBounds(state.massStepIndex);
        const linesInStep = bounds.end - bounds.start + 1;
        const lineInStep = state.lineIndex - bounds.start + 1;

        if (roleEl) {
            roleEl.textContent = roleLabel(line.role);
            roleEl.className = `mass-quest-role mass-quest-role--${line.role}`;
        }
        if (sectionEl) {
            sectionEl.textContent = stepTitle
                ? `${stepTitle} · ${sectionLabel(line.section)}`
                : sectionLabel(line.section);
        }
        if (progressEl) {
            progressEl.textContent = tp("mass_quest.step_progress", "Step {step}/{total} · {line}/{lines}")
                .replace("{step}", String(state.massStepIndex + 1))
                .replace("{total}", String(STEP_COUNT))
                .replace("{line}", String(lineInStep))
                .replace("{lines}", String(linesInStep));
        }

        const isAssembly = line.role === "assembly";
        const hideText =
            state.practiceMode && isAssembly && line.revealable !== false && !state.revealed;

        if (textEl) {
            textEl.textContent = hideText ? "" : line.text;
            textEl.classList.toggle("mass-quest-text--hidden", hideText);
        }

        const atStepEnd = state.lineIndex >= bounds.end;
        const atMassEnd = state.massStepIndex >= STEP_COUNT - 1 && atStepEnd;

        if (actionBtn) {
            if (atMassEnd) {
                actionBtn.hidden = false;
                actionBtn.className = "mass-quest-action mass-quest-action--continue";
                actionBtn.textContent = tp("mass_quest.finished", "Mass responses complete");
                actionBtn.disabled = true;
            } else if (atStepEnd) {
                actionBtn.hidden = false;
                actionBtn.className = "mass-quest-action mass-quest-action--continue";
                actionBtn.textContent = tp("mass_quest.next_step", "Next Mass step");
                actionBtn.disabled = false;
            } else if (isAssembly && line.revealable !== false) {
                actionBtn.hidden = false;
                actionBtn.className = "mass-quest-action mass-quest-action--speak";
                actionBtn.disabled = false;
                actionBtn.textContent = hideText
                    ? responseButtonLabel(line.text)
                    : tp("mass_quest.continue", "Continue");
            } else {
                actionBtn.hidden = false;
                actionBtn.className = "mass-quest-action mass-quest-action--continue";
                actionBtn.disabled = false;
                actionBtn.textContent = tp("mass_quest.continue", "Continue");
            }
        }
    }

    function advanceLine() {
        const bounds = getStepBounds(state.massStepIndex);
        if (state.lineIndex < bounds.end) {
            state.lineIndex += 1;
            state.revealed = false;
            render();
            return true;
        }
        render();
        return false;
    }

    function advanceMassStep() {
        if (state.massStepIndex >= STEP_COUNT - 1) {
            render();
            return false;
        }
        jumpToMassStep(state.massStepIndex + 1);
        return true;
    }

    function handleAction() {
        const line = currentLine();
        if (!line) {
            return;
        }

        const bounds = getStepBounds(state.massStepIndex);
        const atStepEnd = state.lineIndex >= bounds.end;

        if (atStepEnd) {
            if (state.massStepIndex < STEP_COUNT - 1) {
                advanceMassStep();
            }
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

    function syncToMassStep(stepIndex) {
        if (!state.active) {
            return;
        }
        jumpToMassStep(stepIndex, { notify: false });
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
            state.onMassStepChange = options.onMassStepChange || null;
            bindControls();
            filterLines();
        },
        start() {
            state.active = true;
            state.revealed = false;
            filterLines();
            jumpToMassStep(0);
            const encouragement =
                typeof global.CourtyardEvents?.getEncouragement === "function"
                    ? global.CourtyardEvents.getEncouragement()
                    : "";
            if (encouragement && typeof global.setLiturgySubtitle === "function") {
                global.setLiturgySubtitle(encouragement);
            }
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
        getMassStepIndex() {
            return state.massStepIndex;
        },
        syncToMassStep,
        jumpToMassStep,
        render,
        handleAction,
    };
})(window);
