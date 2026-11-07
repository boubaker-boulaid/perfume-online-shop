# Lumé Parfums frontend

The customer shop, built with React, TypeScript and Vite. It's designed for phones first.

**It isn't connected to the backend yet.** All data is fake, and orders aren't saved anywhere.

## Run it

```bash
npm install
npm run dev
```

To open it on your phone, run `npm run dev -- --host` and visit the Network address it prints. Your phone must be on the same Wi-Fi.

| Command | What it does |
|---|---|
| `npm run build` | Checks the types and builds for production |
| `npm run typecheck` | Checks the types only |
| `npm run lint` | Runs ESLint |

## Pages

| Address | Page | Backend endpoint it will use |
|---|---|---|
| `/` | Home | `GET /api/v1/products/featured`, `GET /api/v1/categories` |
| `/shop` | Catalog, with search, filters and sorting | `GET /api/v1/products`, `GET /api/v1/categories` |
| `/shop/:slug` | One product | `GET /api/v1/products/{slug}` |
| `/offers` | Current special offers | `GET /api/v1/offers` (not in the backend yet) |
| `/offers/:slug` | One offer and its perfumes | `GET /api/v1/offers/{slug}` (not in the backend yet) |
| `/cart` | Shopping bag | None, it's kept in the browser |
| `/checkout` | Customer details | `POST /api/v1/orders` |
| `/order-confirmation` | Send the order on WhatsApp | `PATCH .../whatsapp-opened` |

## Folders

```
src/
  components/     Shared pieces, plus layout/ and home/ sections
  pages/          One file per page
  services/api.ts The fake API
  data/           The fake products and categories
  context/        The shopping bag
  hooks/          useApi, which loads data for a page
  styles/         CSS, written for phones first
  types.ts        The shapes of the API's data
```

## Styling

Base styles are for phones. Larger screens add to them with `min-width` media queries at 768px (tablet) and 1024px (desktop). Colors and spacing are variables at the top of `styles/global.css`.

## Connecting the backend

Replace the insides of `src/services/api.ts`. Its functions already have the same inputs, outputs and errors as the real endpoints, so pages and components shouldn't need to change. Read `backend/docs/API.md` for the CSRF step.

Prices are in DH, in `formatPrice` in `utils/format.ts`, like the backend's emails. The design's star ratings have no backend field yet, and the home carousel shows each category's `image_path`, so categories need images in the backend.
