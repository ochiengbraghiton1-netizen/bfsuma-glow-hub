

## Fix: Product Update Validation Error

### Problem Identified
When editing a product without changing the image, you get "Expected string, received null" validation error. This happens because:

- The product's `image_url` from the database is `null` (no image)
- When you click edit, this `null` value is loaded into the form
- The validation schema expects either a `string` or `undefined`, but not `null`
- Zod's `.optional()` only allows `undefined`, not `null`

### Solution
Update the validation schema to accept `null` values for the `image_url` field using `.nullable()` in addition to `.optional()`.

### Changes Required

**File: `src/lib/validations.ts`**

Update the `image_url` field in `productSchema` to also accept `null`:

```text
Current:
  image_url: z.string()
    .max(2000, 'Image URL must be less than 2000 characters')
    .refine(...)
    .optional(),

Fixed:
  image_url: z.string()
    .max(2000, 'Image URL must be less than 2000 characters')
    .refine(...)
    .nullable()
    .optional(),
```

This change allows the field to be:
- A valid URL string
- `null` (no image)
- `undefined` (not provided)

### Additional Improvement
Also update the `resetForm` function in `Products.tsx` to consistently use `null` instead of empty string for `image_url` to match the database behavior:

```text
Line 72: image_url: '',  -->  image_url: null,
```

### Expected Result
After this fix, you will be able to update product inventory (or any other field) without getting validation errors when the product has no image.

