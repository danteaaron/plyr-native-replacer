// ==UserScript==
// @name         Plyr Native Replacer
// @match        *://*/*
// @require      https://cdn.plyr.io/3.7.8/plyr.js
// @resource     plyrCSS https://cdn.plyr.io/3.7.8/plyr.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

(function () {
  GM_addStyle(GM_getResourceText("plyrCSS"));

  GM_addStyle(`
    .plyr-active-page html, .plyr-active-page body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: black;
    }
    .plyr {
      width: 100% !important;
      height: 100vh !important;
    }
    .plyr video {
      width: 100% !important;
      height: 100% !important;
      object-fit: contain;
    }
    .plyr__controls {
      transition: opacity 0.1s ease !important;
    }
  `);

  const initiated = new WeakSet();
  const players = [];

  function initPlyr() {
    document.querySelectorAll("video[controls]").forEach(video => {
      if (!initiated.has(video)) {
        initiated.add(video);
        const player = new Plyr(video);
        players.push(player);
        document.documentElement.classList.add("plyr-active-page");

        player.on("ready", () => {
          player.elements.container.addEventListener("click", () => {
            document.activeElement?.blur();
          });
        });
      }
    });
  }

  new MutationObserver(initPlyr).observe(document.body, { childList: true, subtree: true });
  initPlyr();

  document.addEventListener("keydown", (e) => {
    const player = players[0];
    if (!player) return;
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

    document.activeElement?.blur();

    switch (e.key) {
      case " ": case "k": e.preventDefault(); player.togglePlay(); break;
      case "ArrowRight":  e.preventDefault(); player.forward(5);   break;
      case "ArrowLeft":   e.preventDefault(); player.rewind(5);    break;
      case "ArrowUp":     e.preventDefault(); player.volume = Math.min(1, player.volume + 0.1); break;
      case "ArrowDown":   e.preventDefault(); player.volume = Math.max(0, player.volume - 0.1); break;
      case "f":           e.preventDefault(); player.fullscreen.toggle(); break;
      case "m":           e.preventDefault(); player.muted = !player.muted; break;
    }
  });
})();