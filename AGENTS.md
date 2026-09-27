# Project Architecture Rules

- Use fixed-ratio `storageFittedImageUrl`/`storageFittedSrcSet` variants for contained product and content frames, because width-only storage transforms can distort source aspect ratios.- Join Business visual stories use content_media with content_type='business', content_id='join-business' (fixed constant in use-business-media.ts), because it is a single page, not a per-item table.
