/** Load operator-editable strings for Tiny Priest (group game.tiny_priest). */
window.TINY_PRIEST_COPY = null;

async function loadTinyPriestSiteCopy() {
    try {
        const res = await fetch("/api/site-copy?group=game_tiny_priest");
        if (!res.ok) return;
        const data = await res.json();
        if (data && typeof data === "object") {
            window.TINY_PRIEST_COPY = data;
        }
    } catch (_) {}
}

function tpCopy(suffix, fallback) {
    const map = window.TINY_PRIEST_COPY;
    if (map && map[suffix] != null && String(map[suffix]).length > 0) {
        return String(map[suffix]);
    }
    return fallback;
}
