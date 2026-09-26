# Refine product image cards without reverting

## Changes
- Keep the aspect-ratio delivery fix that prevents distorted product photos.
- Restore the earlier polished appearance by rounding the visible image area and reducing excess inset space.
- Replace the current spin/large zoom with a restrained, smooth hover zoom that does not shift the card.
- Apply the same rounded image treatment to shared product cards and wellness recommendations.

## Verification
- Compare homepage shop cards, category product cards, and wellness recommendations at desktop and mobile sizes.
- Confirm full packaging remains visible, corners are rounded, hover movement is subtle, and the preview has no errors.
