/**
 * Splash GIF (same asset as iOS SplashScreen) → app preview transition.
 * Respects prefers-reduced-motion.
 */
(function () {
  var root = document.querySelector("[data-phone-mock]");
  if (!root) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.remove("phone-mock--loading");
    root.classList.add("phone-mock--static");
    return;
  }

  window.setTimeout(function () {
    root.classList.remove("phone-mock--loading");
    root.classList.add("phone-mock--ready");
  }, 2600);
})();
