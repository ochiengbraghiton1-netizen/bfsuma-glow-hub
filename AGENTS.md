# Project Architecture Rules

- Use fixed-ratio `storageFittedImageUrl`/`storageFittedSrcSet` variants for contained product and content frames, because width-only storage transforms can distort source aspect ratios.- Join Business visual stories use content_media with content_type='business', content_id='join-business' (fixed constant in use-business-media.ts), because it is a single page, not a per-item table.
- Use overflow-x: clip on the document, not hidden, because horizontal clipping must not create a scroll container that prevents sticky positioning.
- Measure the shop toolbar with ResizeObserver and derive the sidebar offset from its height plus the shared header height and a gap, because responsive and expanded category rows change its height.
