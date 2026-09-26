# Fix site-wide image rendering

## Root cause
The live `ProductCard` frame is correctly 296.7 × 296.7px and `aspect-square` is active. Its wrapper chain is also square. The image delivery URL requests only `width=320`; the image service returns a distorted 320 × 1200 variant from a square 1200 × 1200 source. CSS `object-contain` then displays that already-distorted file as a narrow vertical strip.

## Changes
- Add square, aspect-preserving image URL helpers that request width, height, and contain resizing.
- Use those helpers for product images currently served through transformed `src`/`srcSet`: shared product cards, product details, and wellness recommendations.
- Keep the general image helper unchanged so blog, hero, and editorial photography retain their intended proportions.
- Convert category listing thumbnails from fixed `h-52 object-cover` to stable square, contained frames with breathing room and muted fill.
- Normalize shared visual-story image frames so tall or wide uploads cannot stretch page layouts and the full image remains visible; retain native video controls and the before/after interaction.
- Confirm existing direct product images in cart, checkout, modal, affiliate, location, wellness, and blog placements remain square and contained.

## Verification
- Run TypeScript checks and the production build.
- Measure rendered boxes and image natural dimensions after loading.
- Capture desktop and 375px mobile screenshots for the homepage, category listing, category detail, a wellness hub, and a location page.
- Check browser console errors and confirm no temporary data is created.
