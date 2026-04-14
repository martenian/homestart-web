/**
 * Hero app screenshot preview: Plan / Numbers / Accounts tabs.
 */
(function () {
  var root = document.querySelector("[data-app-preview]");
  if (!root) return;

  var img = root.querySelector(".app-preview-img");
  var panel = root.querySelector("#app-preview-panel");
  var tabs = Array.prototype.slice.call(root.querySelectorAll('.preview-tab[role="tab"]'));
  if (!img || !tabs.length) return;

  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
    });
    var src = tab.getAttribute("data-preview-src");
    var alt = tab.getAttribute("data-preview-alt");
    if (src) img.src = src;
    if (alt) img.alt = alt;
    if (panel && tab.id) panel.setAttribute("aria-labelledby", tab.id);
  }

  function focusTab(delta) {
    var current = tabs.findIndex(function (t) {
      return t.getAttribute("aria-selected") === "true";
    });
    if (current < 0) current = 0;
    var next = (current + delta + tabs.length) % tabs.length;
    selectTab(tabs[next]);
    tabs[next].focus();
  }

  tabs.forEach(function (tab) {
    if (tab.getAttribute("aria-selected") !== "true") tab.tabIndex = -1;

    tab.addEventListener("click", function () {
      selectTab(tab);
    });

    tab.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        focusTab(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        focusTab(-1);
      } else if (e.key === "Home") {
        e.preventDefault();
        selectTab(tabs[0]);
        tabs[0].focus();
      } else if (e.key === "End") {
        e.preventDefault();
        selectTab(tabs[tabs.length - 1]);
        tabs[tabs.length - 1].focus();
      }
    });
  });

  /* Warm cache for other screenshots after first paint */
  window.requestIdleCallback =
    window.requestIdleCallback ||
    function (cb) {
      window.setTimeout(cb, 1);
    };
  window.requestIdleCallback(function () {
    tabs.forEach(function (tab) {
      var src = tab.getAttribute("data-preview-src");
      if (src && src !== img.getAttribute("src")) {
        var pre = new Image();
        pre.src = src;
      }
    });
  });
})();
