# Custom Features Implementation Plan

This plan details the implementation for the Custom Gift Box Builder, Color Variant Selector, and Custom Branding Upload Checkout Step.

## User Review Required

> [!IMPORTANT]
> Please review the open questions below before approving this plan.

## Open Questions

1. **Quick View Modal**: Currently, the "Quick View" button on the `ProductCard` just links to the Product Page. Do you want me to build a real popup modal for Quick View, or just add the Color Selector to the Product Card and Product Page?
2. **Supabase Storage**: For the branding file upload (up to 10MB), passing it as Base64 to the API will exceed Vercel's 4.5MB payload limit. We must upload it directly to Supabase Storage from the browser. 
   **Action required**: Do you have a storage bucket created in Supabase (e.g., named `branding`)? If not, I can provide the SQL to create it.
3. **Box Builder Items**: Which products should appear in the Box Builder? Currently, I plan to fetch all non-set products (pens, power banks, etc.) and let the user select from them. Is that correct?

---

## Proposed Changes

### 1. Color Variant Selector

#### [MODIFY] src/lib/products.ts
- Add `variants?: { color: string; hex: string; image: string }[]` to the `Product` interface.

#### [MODIFY] src/lib/cart.ts
- Add `color?: string` to `CartItem` interface to store the selected variant.

#### [NEW] src/components/ColorSelector.tsx
- Create a reusable component to render the color swatches (circles with hex background).
- Support disabled/grayed-out state if no stock/image.
- Maintain local state for the selected color.

#### [MODIFY] src/app/[locale]/product/[code]/page.tsx
- Integrate `ColorSelector` below the product title.
- Keep track of the selected variant in the page's local state and pass the selected `image` to `ProductImage`.
- Pass the selected `color` to `ProductActions` -> `AddToCartButton`.

### 2. Custom Gift Box Builder

#### [MODIFY] src/lib/cart.ts
- Add `bundleItems?: { code: string; name: string; quantity: number }[]` to `CartItem`.

#### [NEW] src/components/BoxBuilder.tsx
- Create the bundle configurator UI to display individual products as cards with quantity steppers (+/-).
- Maintain local state for selected items and their quantities.
- Dynamically calculate the total price: `baseBoxPrice + sum(item.price * qty)`.
- Replace standard `AddToCartButton` with a custom "Add Custom Box to Cart" button that formats the cart item (e.g., name: `Custom VIP Box — Pen ×2, Notebook ×1`).

#### [MODIFY] src/app/[locale]/product/[code]/page.tsx
- For products with `type === 'set'` or `tags.includes('vip')`, render the `BoxBuilder` section below the main info.
- Fetch individual products to pass as props to `BoxBuilder`.

### 3. Custom Branding Upload Step

#### [MODIFY] src/components/CartDrawer.tsx
- Introduce a new state `step === "branding"` between the "cart" review and "contact" info.
- Add UI fields: File Upload (Drag & Drop), Branding Notes (`textarea`), Color Preference, and a "Virtual Sample" checkbox.
- Handle file upload directly to Supabase Storage using `@supabase/supabase-js` client to bypass Vercel limits.
- Save the resulting file URL to the order metadata.
- Provide a "Skip, use standard" button.

#### [MODIFY] src/app/api/quote/route.ts
- Update the API payload to receive `branding` details (file URL, notes, color, sample request).
- Append these branding details to the Supabase database insert (`quote_requests` table).
- Include the branding notes and the file URL link in the Resend confirmation email body.

## Verification Plan

### Automated Tests
- No automated tests currently exist, skipping.

### Manual Verification
- **Box Builder**: Test selecting items, updating quantities, verifying the real-time total price, and adding it to the cart to ensure it appears as a single grouped item.
- **Color Selector**: Test clicking color swatches, verifying the main image swaps instantly, and ensuring the selected color persists in the cart.
- **Branding Upload**: Test uploading a large image, filling out notes, and submitting the quote. Verify that the file is uploaded to Supabase Storage and the correct URL + notes are saved to the database and sent via email.
