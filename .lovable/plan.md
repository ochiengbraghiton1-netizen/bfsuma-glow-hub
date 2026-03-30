

## Plan: Add Category Image Upload in Admin Dashboard

### Problem
Categories on the shop page show placeholder tag icons because they have no images. The admin form only accepts a manual URL — there's no file upload.

### Solution
Add a proper image upload field to the admin Categories form, using a new `categories` storage bucket, so admins can upload images directly.

### Steps

**1. Create `categories` storage bucket (database migration)**
- Create a public `categories` bucket in Supabase storage
- Add RLS policies: public read access, authenticated users can upload/update/delete

**2. Update Admin Categories form (`src/pages/admin/Categories.tsx`)**
- Replace the plain "Image URL" text input with a file upload field (drag-and-drop or click-to-browse)
- On file select: compress/resize the image, upload to the `categories` bucket, and set the resulting public URL as `image_url`
- Show a preview of the current/uploaded image in the form
- Keep the ability to clear the image

**3. Add image preview to the categories table**
- Show a small thumbnail in the category list table so admins can see which categories have images at a glance

### Technical Details
- Reuse the existing image compression utility (`src/lib/image-compression.ts`) for consistent optimization
- Upload path pattern: `categories/{category-slug}-{timestamp}.webp`
- The shop page (`CategoryPage.tsx`) already renders `image_url` when present — no frontend shop changes needed

