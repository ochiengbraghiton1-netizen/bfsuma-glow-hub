/**
 * Scrolls to a homepage section, retrying briefly because the below-the-fold
 * sections mount after the first paint (and after a route change to "/").
 */
export const scrollToSection = (id: string) => {
  const started = Date.now();
  let found = 0;
  let cancelled = false;

  // Any deliberate input from the visitor wins immediately.
  const cancel = () => {
    cancelled = true;
    removeListeners();
  };
  const events = ["wheel", "touchstart", "touchmove", "keydown", "pointerdown"] as const;
  const removeListeners = () => {
    events.forEach((e) => window.removeEventListener(e, cancel));
  };
  events.forEach((e) => window.addEventListener(e, cancel, { passive: true }));

  const tick = () => {
    if (cancelled) return;
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      // Re-align while lazy sections above keep mounting and shifting layout.
      if (Math.abs(top - window.scrollY) > 4) {
        window.scrollTo({ top, behavior: found ? "auto" : "smooth" });
      }
      if (!found) found = Date.now();
      if (Date.now() - found < 2500) {
        requestAnimationFrame(tick);
      } else {
        removeListeners();
      }
      return;
    }
    if (Date.now() - started < 5000) requestAnimationFrame(tick);
    else removeListeners();
  };
  tick();
};
