/**
 * Scrolls to a homepage section, retrying briefly because the below-the-fold
 * sections mount after the first paint (and after a route change to "/").
 */
export const scrollToSection = (id: string) => {
  const started = Date.now();
  let found = 0;
  const tick = () => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      // Re-align while lazy sections above keep mounting and shifting layout.
      if (Math.abs(top - window.scrollY) > 4) {
        window.scrollTo({ top, behavior: found ? "auto" : "smooth" });
      }
      if (!found) found = Date.now();
      if (Date.now() - found < 2500) requestAnimationFrame(tick);
      return;
    }
    if (Date.now() - started < 5000) requestAnimationFrame(tick);
  };
  tick();
};
