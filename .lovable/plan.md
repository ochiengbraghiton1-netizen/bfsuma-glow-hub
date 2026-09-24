# Visual Story Improvements

## Scope
Improve the existing visual-story system across wellness hubs, location pages, and category pages without changing unrelated page content or layout.

## Implementation
1. **Shared scroll reveal**
   - Add a one-time IntersectionObserver reveal to `ContentMediaBlock` using the existing `useInView` hook.
   - Use a subtle opacity and upward transition lasting about 500ms with ease-out.
   - Render media normally when reduced motion is enabled.
   - Replace the duplicate wellness-hub media renderer with `ContentMediaBlock` so all three surfaces receive identical behavior.

2. **Editable slot headings**
   - Add a nullable `heading` field to `content_media` through a database migration.
   - Add a short heading input to every populated slot in `ContentMediaEditor`.
   - Preserve the heading in upload and save operations.
   - Use custom headings on category, wellness-hub, and location pages, falling back to each page's current generic heading when blank.

3. **Desired-outcome before/after comparison**
   - Add nullable `before_media_url` and `before_alt_text` fields to `content_media`; the existing image remains the “after” image.
   - In the editor, show an optional second-image uploader only for `desired_outcome`, with preview, replacement, removal, and required alt text when present.
   - In `ContentMediaBlock`, render an accessible pointer/touch/keyboard comparison slider only when the desired-outcome item has two images.
   - Keep the existing single image or video rendering when no before image exists. The optional before image will accept images only.

## Technical details
- The comparison uses a clipped image layer, range control semantics, visible Before/After labels, stable aspect sizing, and no autoplay.
- Existing access policies remain unchanged; only nullable fields are added.
- Existing records continue working because all new fields are optional.
- No new animation library, table, storage bucket, or unrelated page changes.

## Verification
- Run TypeScript checks and the production build.
- Verify one wellness hub, location page, and category page in the browser.
- Confirm custom-heading fallbacks, one-time reveal behavior, reduced-motion behavior, pointer/touch/keyboard comparison controls, mobile layout, and no console errors.
- Use temporary records only if needed for complete visual testing, then remove them.
