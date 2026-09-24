# Extend visual stories to category detail pages

## Scope
- Reuse the existing `content_media` table, `content-media` storage, `ContentMediaEditor`, and `ContentMediaBlock`.
- Make no new tables, buckets, shared components, or changes to category-listing behavior.
- Keep the category breadcrumb/back link, product query/grid, and both JSON-LD blocks unchanged.

## Admin category editor
- Add category media state and load all seven slots when an existing category opens, using `content_type = 'category'` and the category UUID.
- Reset media when the dialog closes or a new category is opened, preventing one category’s visuals from appearing in another edit.
- Show `ContentMediaEditor` only for an existing category, below Image, Display Order, and Active.
- Require alt text for every uploaded visual, matching the existing wellness-hub save behavior.
- Save category fields first, then save its full media set. If media saving fails, keep the dialog open and report that failure instead of claiming the whole edit succeeded.

## Category detail page
- Fetch category media after the active category UUID is available.
- Keep the zero-media layout visually equivalent to the current page.
- Render only populated slots:
  - `hero`: category heading/description area, side-by-side on larger screens.
  - `recognition`: conditional early two-column section.
  - `desired_outcome`: conditional follow-up section with reversed visual order.
  - `education`: conditional short section pairing the category description context with its media.
  - `product_context`: immediately above the existing product grid.
  - `trust`: conditional support strip after the product grid.
  - `closing`: conditional final visual near the bottom of the category content.
- Use the shared renderer so images retain responsive loading and videos remain native-controls-only with no autoplay or carousel.

## Verification
- Run the project’s TypeScript check and production build, then inspect the latest preview build signal.
- Browser-test a real category detail page at 1280px and 375px with its current zero-media state; confirm no console/runtime errors and no empty visual sections.
- Temporarily populate all seven category slots with test media, verify every render point plus the admin editor, then remove the temporary media and confirm the real category returns to zero-media state.

## Mandatory security follow-up
- The current `content-media` storage read rule allows every signed-in account to download every stored object. Tightening it to privileged content editors would remove that unintended access while preserving the long-lived URLs already rendered publicly. This is separate from the category wiring and changes behavior only for non-admin signed-in users attempting direct storage access.
