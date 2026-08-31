window.HANGMAN_COPY = null;

async function loadHangmanSiteCopy() {
    try {
        const res = await fetch("/api/site-copy?group=game_hangman");
        if (!res.ok) return;
        const data = await res.json();
        if (data && typeof data === "object") {
            window.HANGMAN_COPY = data;
        }
    } catch (_) {}
}

function hmCopy(suffix, fallback) {
    const map = window.HANGMAN_COPY;
    if (map && map[suffix] != null && String(map[suffix]).length > 0) {
        return String(map[suffix]);
    }
    return fallback;
}

function applyHangmanDomCopy() {
    const sub = document.querySelector("header p");
    if (sub) sub.textContent = hmCopy("subtitle", sub.textContent);
    const attemptsLabel = document.querySelector(".info p:first-child");
    if (attemptsLabel) {
        const span = attemptsLabel.querySelector("span");
        attemptsLabel.firstChild.textContent = hmCopy("attempts", "Attempts Left: ") + " ";
    }
    const guessed = document.querySelector(".info p:nth-child(2)");
    if (guessed) {
        guessed.firstChild.textContent = hmCopy("guessed", "Guessed: ") + " ";
    }
    const guessBtn = document.getElementById("guess-btn");
    if (guessBtn) guessBtn.textContent = hmCopy("guess_btn", guessBtn.textContent);
    const resetBtn = document.getElementById("reset-btn");
    if (resetBtn) resetBtn.textContent = hmCopy("reset_btn", resetBtn.textContent);
}
