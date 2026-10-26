// Resolve and apply the saved theme before first paint, so the page never
// flashes the wrong palette. Inlined into every page's <head> verbatim by
// scripts/extract-theme-prelude.mjs, ahead of any React code: it must run
// synchronously and cannot be a module.
(function () {
  var choice = "system";
  try {
    var key = "speakwith-theme";
    var raw = localStorage.getItem(key);
    if (raw == null) {
      var legacy = localStorage.getItem("lifebond-theme");
      if (legacy != null) {
        localStorage.setItem(key, legacy);
        localStorage.removeItem("lifebond-theme");
        raw = legacy;
      }
    }
    if (raw === "system" || raw === "light" || raw === "dark") {
      choice = raw;
    }
  } catch (e) {}
  var resolved = choice === "system"
    ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
    : choice;
  document.documentElement.setAttribute("data-theme", resolved);
})();
