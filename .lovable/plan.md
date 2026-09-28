# Show all category icons on desktop

## Changes
- Keep the current six-category plus More/Less interaction unchanged below the `md` breakpoint.
- Render every category at `md` and wider, hide the overflow control there, and center/wrap the icon row.
- Preserve filtering, selected rings, the All option, image fallbacks, and mobile touch scrolling.

## Verification
- Check 375px for the unchanged collapsed mobile row and working expansion/filter selection.
- Check 1024px, 1280px, and 1440px for complete category visibility, no More/Less control, wrapping, and sidebar overlap.
- Measure and report the sticky toolbar height at each desktop width.
- Run the project typecheck and build, then confirm screenshots and browser console health.

## Technical details
- Use responsive visibility classes on categories beyond the first six and `md:hidden` on More/Less.
- Switch the row to desktop `justify-center`, `flex-wrap`, and non-scrolling overflow while retaining mobile horizontal overflow.
- If measured wrapping causes overlap with the fixed sidebar offset, make the smallest responsive sizing or offset adjustment needed.
