# Restore Category Card Images

## Goal
Match the earlier category grid shown in the second screenshot while leaving product cards unchanged.

## Changes
- Restore category images to a wide 3:2 frame instead of a square frame.
- Make each category photo fill the full frame with rounded corners and no inner padding.
- Keep the title and description over the lower image gradient.
- Add only a subtle, smooth hover zoom to avoid excessive movement.
- Preserve the existing category links, content, loading behavior, and mobile grid.

## Verification
- Check `/products` on desktop and a 375px mobile viewport.
- Confirm images fill the cards, corners are rounded, text remains readable, and no preview errors appear.
