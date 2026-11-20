# Lumé Parfums frontend

The customer shop, built with React, TypeScript and Vite. It's designed for phones first.

It gets its products, offers and categories from the Laravel backend in `backend/`, and sends orders to it.

## Run it

Start the backend first (see `backend/README.md`), then:

```bash
cp .env.example .env   # sets VITE_API_URL, the backend's address
npm install
npm run dev -- --host 127.0.0.1
```

Open the shop at `http://127.0.0.1:5173`, not `localhost`: the backend's cookies are set for `127.0.0.1`, and without them placing an order fails with 419.

To open it on your phone, run `npm run dev -- --host` and visit the Network address it prints. Your phone must be on the same Wi-Fi.

| Command | What it does |
|---|---|
| `npm run build` | Checks the types and builds for production |
| `npm run typecheck` | Checks the types only |
| `npm run lint` | Runs ESLint |

## Pages

| Address | Page | Backend endpoint |
|---|---|---|
| `/` | Home | `GET /api/v1/products/featured`, `GET /api/v1/categories` |
| `/shop` | Catalog, with search, filters and sorting | `GET /api/v1/products`, `GET /api/v1/categories` |
| `/shop/:slug` | One product | `GET /api/v1/products/{slug}` |
| `/offers` | Current special offers | `GET /api/v1/offers` |
| `/offers/:slug` | One offer and its perfumes | `GET /api/v1/offers/{slug}` |
| `/cart` | Shopping bag | None, it's kept in the browser |
| `/checkout` | Customer details | `POST /api/v1/orders` |
| `/order-confirmation` | Send the order on WhatsApp | `PATCH .../whatsapp-opened` |

## Folders

```
src/
  components/     Shared pieces, plus layout/ and home/ sections
  pages/          One file per page
  services/       The API calls (api.ts), sent with axios (http.ts)
  data/           The home carousel's bottles
  context/        The shopping bag
  hooks/          useApi, which loads data for a page
  styles/         CSS, written for phones first
  types.ts        The shapes of the API's data
```

## Styling

Base styles are for phones. Larger screens add to them with `min-width` media queries at 768px (tablet) and 1024px (desktop). Colors and spacing are variables at the top of `styles/global.css`.

## The backend

`src/services/api.ts` has one function per endpoint in `backend/docs/API.md`, with the same inputs, outputs and errors. Before an order, `http.ts` fetches the CSRF cookie that the backend asks for.

Prices are in DH, in `formatPrice` in `utils/format.ts`, like the backend's emails.
