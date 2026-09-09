(async function () {
  if (typeof loadHangmanSiteCopy === "function") {
    await loadHangmanSiteCopy();
    if (typeof applyHangmanDomCopy === "function") applyHangmanDomCopy();
  }
  try {
    const res = await fetch("/api/hangman-words");
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items) && items.length > 0) {
        window.HANGMAN_WORD_DATA = items.map(function (i) {
          return { word: i.word, hint: i.hint || "" };
        });
      }
    }
  } catch (_) {}
  await new Promise(function (resolve) {
    var s = document.createElement("script");
    s.src = "hangman.js";
    s.onload = resolve;
    document.body.appendChild(s);
  });
})();
