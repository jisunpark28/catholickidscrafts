#!/usr/bin/env python3
"""Merge full upstream Tiny Priest script with entry flow, decorations, church_inside."""
from pathlib import Path
import re

base = Path("/tmp/tiny-priest-base.js").read_text()
current = Path("public/games/tiny-priest/script.js").read_text()

base = base.replace(
    """const CHARACTER_CONFIG = {
    priest: {
        frontImage: "assets/priest_front.png",
        backImage: "assets/priest_back.png",
        welcomeText: "Father: Peace be with you! Let's walk through the center door.",
    },
    nun: {
        frontImage: "assets/nun_front.png",
        backImage: "assets/nun_back.png",
        welcomeText: "Sister: Let us pray together. We'll enter through the center door now.",
    },
};""",
    """const CHARACTER_CONFIG = {
    priest: {
        frontImage: "assets/priest_front.png",
        backImage: "assets/priest_back.png",
        greetingText: "Father: Peace be with you! Welcome to our church.",
        enterPromptText: "Would you like to go inside?",
    },
    nun: {
        frontImage: "assets/nun_front.png",
        backImage: "assets/nun_back.png",
        greetingText: "Sister: Let us pray together. Welcome to our church.",
        enterPromptText: "Would you like to go inside?",
    },
};

const DEFAULT_ENTRY_DIALOGUE = "Tap the priest or sister to say hello!";""",
    1,
)

if "showHotspotModal" not in base:
    base = base.replace(
        "const APP_STATE = {",
        '''

function showHotspotModal(title, description) {
    const modal = document.getElementById("hotspot-modal");
    const titleEl = document.getElementById("hotspot-modal-title");
    const bodyEl = document.getElementById("hotspot-modal-body");
    if (!modal || !titleEl || !bodyEl) return;
    titleEl.textContent = title || "";
    bodyEl.textContent = description || "";
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
}

function hideHotspotModal() {
    const modal = document.getElementById("hotspot-modal");
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
}

function bindHotspotModal() {
    const close = document.getElementById("hotspot-modal-close");
    const modal = document.getElementById("hotspot-modal");
    if (close && !close.dataset.bound) {
        close.dataset.bound = "true";
        close.addEventListener("click", hideHotspotModal);
    }
    if (modal && !modal.dataset.bound) {
        modal.dataset.bound = "true";
        modal.addEventListener("click", (e) => {
            if (e.target === modal) hideHotspotModal();
        });
    }
}

function updateMassToggleButton() {
    const btn = document.getElementById("mass-toggle-btn");
    if (!btn || !APP_STATE.threeWorld) return;
    const active = APP_STATE.threeWorld.isMassActive();
    btn.classList.toggle("is-active", active);
    btn.textContent = active ? "Stop Mass" : "Start Mass";
}

const APP_STATE = {''',
        1,
    )

base = base.replace(
    "    selectedCharacter: null,\n    threeWorld: null,",
    "    selectedCharacter: null,\n    greetedCharacter: null,\n    threeWorld: null,",
    1,
)

hud_pat = re.compile(
    r"function setHudButtonsState\([\s\S]*?^function bindHudControls\(\) \{[\s\S]*?^\}",
    re.MULTILINE,
)
hud_current = hud_pat.search(current)
hud_base = hud_pat.search(base)
if hud_current and hud_base:
    base = base[: hud_base.start()] + hud_current.group(0) + base[hud_base.end() :]

if "unlockCharacterSelection" not in base:
    base = base.replace(
        'function lockCharacterSelection() {\n    document.querySelectorAll(".character").forEach((el) => {\n        el.style.pointerEvents = "none";\n    });\n}\n',
        '''function lockCharacterSelection() {
    document.querySelectorAll(".character").forEach((el) => {
        el.style.pointerEvents = "none";
    });
}

function unlockCharacterSelection() {
    document.querySelectorAll(".character").forEach((el) => {
        el.style.pointerEvents = "";
    });
}

function showEntryActions(visible) {
    const actions = document.getElementById("entry-actions");
    if (!actions) return;
    actions.hidden = !visible;
}

function highlightGreetedCharacter(character) {
    document.querySelectorAll(".character").forEach((el) => {
        const isMatch = Boolean(character) && el.dataset.character === character;
        el.classList.toggle("is-greeted", isMatch);
        el.setAttribute("aria-pressed", isMatch ? "true" : "false");
    });
}

function resetEntryPromptUi() {
    APP_STATE.greetedCharacter = null;
    showEntryActions(false);
    highlightGreetedCharacter(null);
    unlockCharacterSelection();
    setDialogue(DEFAULT_ENTRY_DIALOGUE);
}

''',
        1,
    )

if "churchInsidePlane" not in base:
    base = base.replace(
        "    root.add(backWall, leftWall, rightWall, ceiling);\n\n    const sanctuaryStep",
        '''    root.add(backWall, leftWall, rightWall, ceiling);

    const interiorTextureLoader = new THREE.TextureLoader();
    const churchInsideTexture = interiorTextureLoader.load("assets/church_inside.png");
    if ("colorSpace" in churchInsideTexture) {
        churchInsideTexture.colorSpace = THREE.SRGBColorSpace;
    }
    churchInsideTexture.minFilter = THREE.LinearMipmapLinearFilter;
    churchInsideTexture.magFilter = THREE.LinearFilter;
    const churchInsidePlane = new THREE.Mesh(
        new THREE.PlaneGeometry(33.6, 10.6),
        new THREE.MeshBasicMaterial({
            map: churchInsideTexture,
            toneMapped: false,
        }),
    );
    churchInsidePlane.position.set(0, 6.05, -17.02);
    root.add(churchInsidePlane);
    backWall.visible = false;

    const sanctuaryStep''',
        1,
    )

if "loadChurchDecorations" not in base:
    dec_pat = re.search(
        r"    const decorationMeshes = \[\];[\s\S]*?spawnSparkles\(hit\.point, hit\.object === altarCloth \? altarCloth\.material\.color\.getHex\(\) : 0xffe596\);\n    \}\);\n",
        current,
    )
    anchor = "    const cameraOffset = new THREE.Vector3(0, 4.6, 9.2);"
    if dec_pat and anchor in base:
        base = base.replace(anchor, dec_pat.group(0) + "\n" + anchor, 1)

old_tail = """/**
 * Handles character interaction and transitions to the 3D church scene.
 * @param {string} character
 */
async function handleInteract(character) {
    if (APP_STATE.isTransitioning || !CHARACTER_CONFIG[character]) {
        return;
    }

    APP_STATE.isTransitioning = true;
    APP_STATE.selectedCharacter = character;

    const characterEl = getCharacterElement(character);
    if (!characterEl) {
        APP_STATE.isTransitioning = false;
        return;
    }

    lockCharacterSelection();
    switchToBackSprite(character, characterEl);
    setDialogue(CHARACTER_CONFIG[character].welcomeText);

    await animateCharacterEntry(characterEl);
    await animateDoorZoomTransition();
    await activateThreeScene(character);
}

window.handleInteract = handleInteract;
window.getLiturgicalSeason = getLiturgicalSeason;
"""

tail_start = current.find("/**\n * First tap:")
if tail_start < 0:
    raise SystemExit("entry tail not found in current script")
new_tail = current[tail_start:]
if old_tail not in base:
    raise SystemExit("old tail not found in base script")
base = base.replace(old_tail, new_tail, 1)

base = base.replace(
    "    APP_STATE.isTransitioning = false;\n    setDialogue(message);",
    "    APP_STATE.isTransitioning = false;\n    APP_STATE.greetedCharacter = null;\n    showEntryActions(false);\n    highlightGreetedCharacter(null);\n    setDialogue(message);",
    1,
)

base = base.replace(
    'setDialogue("성당 안으로 들어갑니다…");',
    'setDialogue("Walking into the church…");',
)

Path("public/games/tiny-priest/script.js").write_text(base)
print(f"OK: {len(base.splitlines())} lines")
