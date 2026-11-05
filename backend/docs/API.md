# Lume Perfums API

Everything needed to build a frontend against this API. To try the requests, import [lume-perfums.postman_collection.json](lume-perfums.postman_collection.json) into Postman.

**Base URL:** `http://127.0.0.1:8000` in local development. API routes start with `/api`. Login and password routes are at the root, with no `/api`.

## Contents

- [Conventions](#conventions)
- [Calling the API from a browser](#calling-the-api-from-a-browser)
- [Public endpoints](#public-endpoints)
- [Orders](#orders)
- [Authentication](#authentication)
- [Admin endpoints](#admin-endpoints)
- [Data objects](#data-objects)

## Conventions

### Requests

Send `Accept: application/json` on every request. Send JSON bodies with `Content-Type: application/json`, except when uploading an image, which uses `multipart/form-data`.

### Responses

Successful responses share one shape:

```json
{
  "success": true,
  "message": "Product Retrieved",
  "data": {},
  "errors": null
}
```

Paginated lists add `meta` and `links`. Lists return 10 items per page, and you choose the page with `?page=2`.

```json
{
  "success": true,
  "message": "Products retrieved.",
  "data": [],
  "meta": { "current_page": 1, "per_page": 10, "total": 3, "last_page": 1 },
  "links": {
    "first": "http://127.0.0.1:8000/api/v1/products?page=1",
    "prev": null,
    "next": null,
    "last": "http://127.0.0.1:8000/api/v1/products?page=1"
  },
  "errors": null
}
```

Deleting returns `204 No Content` with an empty body.

Prices are strings with two decimals, such as `"890.00"`, so convert them before doing arithmetic. Dates are ISO 8601 in UTC.

### Errors

Errors have the same shape, with `success: false`. Validation errors list the messages for each field:

```json
{
  "success": false,
  "message": "The given data was invalid",
  "data": null,
  "errors": {
    "sort": ["The selected sort is invalid."]
  }
}
```

Fields inside arrays use dotted names, such as `items.0.quantity`.

| Status | Meaning | What to do |
|---|---|---|
| 400 | Not enough stock | Show `message`, which names the product and the quantity available |
| 401 | Not logged in, or the session expired | Send the user to the login page |
| 403 | Logged in but not an admin, or a signed link that's invalid or expired | Show an error |
| 404 | The record or endpoint doesn't exist, or the product is hidden | Show a not found page |
| 409 | Can't delete a category that still has products, or logging in while already logged in | Show `message` |
| 419 | CSRF token missing or expired | Call `/sanctum/csrf-cookie` again, then retry |
| 422 | Validation failed, or the status change isn't allowed | Show `errors`, or `message` when `errors` is null |
| 429 | Too many requests | Wait for the number of seconds in the `Retry-After` header |
| 500 | Server error | Show a general error and let the user retry |

### Rate limits

| Applies to | Limit | Counted per |
|---|---|---|
| All `/api/v1` routes | 60 per minute | User, or IP address for guests |
| `POST /api/v1/orders` and `PATCH .../whatsapp-opened` | 10 per minute | IP address |
| `/login`, `/forgot-password`, `/reset-password` | 6 per minute | IP address |

## Calling the API from a browser

The API uses Laravel Sanctum's cookie sessions. This has two requirements for a frontend running in a browser:

1. **The frontend's address must be allowed.** `SANCTUM_STATEFUL_DOMAINS` and `FRONTEND_URL` in the backend's `.env` must match it, including the port.
2. **Every request that changes something needs a CSRF token**, and this includes `POST /api/v1/orders`, even for guests. Otherwise the response is `419`.

Call `GET /sanctum/csrf-cookie` once before the first such request. It sets an `XSRF-TOKEN` cookie, and your HTTP client sends the cookie's value back in an `X-XSRF-TOKEN` header. With axios, this is all you need:

```js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  withCredentials: true,
  withXSRFToken: true,
  headers: { Accept: 'application/json' },
});

await api.get('/sanctum/csrf-cookie');
```

Use the same hostname for the frontend and the API. The backend's `SESSION_DOMAIN` is `127.0.0.1` by default, so opening the frontend on `localhost` means the cookies won't be sent.

Requests from outside a browser, with no `Referer` or `Origin` header, don't need a CSRF token for public endpoints. Admin routes still need a logged-in cookie session, and no endpoint issues API tokens.

## Public endpoints

These need no login.

### GET /api/status

Checks that the API is running. It doesn't use the usual response shape.

```json
{
  "success": true,
  "message": "Shop API is running",
  "version": "1.0.0",
  "timestamp": "2026-11-05T22:15:04.888506Z"
}
```

### GET /api/v1/categories

Lists active categories, by `sort_order` and then newest first, paginated. Each one is a [Category](#category) with `products_count`, which only counts active products.

### GET /api/v1/products

Lists active products in active categories, paginated. Each one is a [Product](#product).

| Query parameter | Type | Notes |
|---|---|---|
| `q` | string, max 100 | Searches the product name |
| `category` | string | The slug of an active category. Any other value returns 422. |
| `min_price`, `max_price` | number | Inclusive |
| `sort` | string | `newest`, `oldest`, `price_asc` or `price_desc`. If left out, products are listed by `sort_order` and then newest first. |
| `page` | integer | Page number |

Example: `GET /api/v1/products?category=floral&max_price=1000&sort=price_asc`

### GET /api/v1/products/featured

Returns up to 5 featured products from the public catalog, in a random order that changes on each request. It's not paginated.

### GET /api/v1/products/{slug}

Returns one [Product](#product). The response is 404 if the product is unknown or hidden, or if its category is hidden.

## Orders

### POST /api/v1/orders

Places an order. It's a public endpoint, so customers don't need an account. Stock is reduced as soon as the order is placed.

| Field | Rules |
|---|---|
| `customer_name` | Required, max 50 characters |
| `phone` | Required, max 13 characters including spaces. Digits, spaces and `+ ( ) . -` are allowed. |
| `email` | Required, valid email address |
| `city` | Required, max 50 characters |
| `address` | Required, max 255 characters |
| `note` | Optional, max 255 characters |
| `idempotency_key` | Required, a UUID. [See below](#avoiding-duplicate-orders). |
| `items` | Required, 1 to 99 lines |
| `items[].product_id` | Required, an active product in an active category. A product can only appear once per order. |
| `items[].quantity` | Required, whole number from 1 to 99 |

Each item may only contain `product_id` and `quantity`. Sending anything else in an item, such as `price`, returns 422. Other unknown fields in the body, such as `total`, are ignored. The server always calculates the total itself.

```json
{
  "customer_name": "Sara Alaoui",
  "phone": "+212600000000",
  "email": "sara@example.com",
  "city": "Agadir",
  "address": "12 Avenue Hassan II",
  "note": "Call before delivery",
  "idempotency_key": "14f8fbfc-3544-454d-8da5-f3317c26f9c1",
  "items": [
    { "product_id": 1, "quantity": 2 }
  ]
}
```

Response, `201 Created`:

```json
{
  "success": true,
  "message": "The order was created successfully.",
  "data": {
    "order_number": "ORD-2026-000001",
    "total": "1780.00",
    "whatsapp_link": "https://wa.me/212600000000?text=New%20Order%20ORD-2026-000001...",
    "whatsapp_opened_url": "http://127.0.0.1:8000/api/v1/orders/ORD-2026-000001/whatsapp-opened?expires=1793918705&signature=..."
  },
  "errors": null
}
```

If there isn't enough stock, the response is `400` and nothing is saved:

```json
{
  "success": false,
  "message": "Insufficient stock for Celestial Rose. Stock requested: 99, Stock avaliable: 23.",
  "data": null,
  "errors": null
}
```

#### Avoiding duplicate orders

Generate one UUID when the customer starts checkout, with `crypto.randomUUID()`, and keep it until the order succeeds. Reuse it on every retry, for example after a network error.

If an order with that key already exists, the API returns that order with `200` instead of `201`, and doesn't create a second one or reduce the stock again. The rest of the request is ignored, so generate a new key if the customer changes their cart.

#### After the order is placed

1. Open `whatsapp_link` so the customer can send the order to the shop.
2. Call `PATCH` on `whatsapp_opened_url` when they open it. This stops the reminder email and the 1 hour cancellation.

Without step 2, a pending order gets a reminder email after 30 minutes and is cancelled after 1 hour, even if the customer did send the message.

### PATCH /api/v1/orders/{orderNumber}/whatsapp-opened

Records that the customer opened WhatsApp. Don't build this URL yourself: use `whatsapp_opened_url` from the order response. It's signed and expires after 30 minutes.

Returns `204`. An invalid or expired signature returns `403`.

## Authentication

Only admins have accounts, and there's no public sign-up. These routes are at the root, without `/api`.

| Method and path | Body | Success |
|---|---|---|
| `GET /sanctum/csrf-cookie` | None | `204`, sets the CSRF cookie |
| `POST /login` | `email`, `password`, optional `remember` | `204`, starts the session |
| `POST /logout` | None | `204` |
| `POST /forgot-password` | `email` | `200`, `{ "status": "..." }`, emails a reset link |
| `POST /reset-password` | `token`, `email`, `password`, `password_confirmation` | `200`, `{ "status": "..." }` |

Log in like this:

```js
await api.get('/sanctum/csrf-cookie');
await api.post('/login', { email, password });

const { data: admin } = await api.get('/api/v1/admin/me');
```

Wrong credentials return `422` with the message under `errors.email`. Five failed attempts lock the login for a short time, and also return `422`. Logging in while already logged in returns `409`, and so do the password routes.

The reset email links to `{FRONTEND_URL}/password-reset/{token}?email={email}`, so the frontend needs a page at that path. It should send those values to `POST /reset-password`.

The verification routes, `GET /verify-email/{id}/{hash}` and `POST /email/verification-notification`, exist but aren't needed: admin accounts are created already verified.

## Admin endpoints

These all start with `/api/v1/admin` and need a logged-in admin. A guest gets `401`, and a logged-in user who isn't an admin gets `403`.

### GET /api/v1/admin/me

Returns the logged-in admin. **This one isn't wrapped in the usual response shape:**

```json
{
  "id": 1,
  "name": "Admin",
  "email": "admin@example.com",
  "email_verified_at": "2026-11-05T22:15:05.000000Z",
  "is_admin": true,
  "created_at": "2026-11-05T22:15:05.000000Z",
  "updated_at": "2026-11-05T22:15:05.000000Z"
}
```

### GET /api/v1/admin/stats

Returns the dashboard numbers, cached for 5 minutes.

```json
{
  "success": true,
  "message": "Stats retrieved.",
  "data": {
    "revenue_this_month": 0,
    "orders_by_status": { "pending": 0, "confirmed": 1, "shipped": 0, "delivered": 0, "cancelled": 0 },
    "revenue_last_30_days": [{ "date": "2026-11-05", "revenue": 0 }],
    "top_products": [
      { "product_id": 1, "name": "Celestial Rose", "slug": "celestial-rose", "stock": 23, "sold": 2, "revenue": 1780 }
    ],
    "low_stock": [{ "id": 4, "name": "Oud Royal", "slug": "oud-royal", "stock": 2, "is_active": true }],
    "pending_over_24h": [
      {
        "id": 1,
        "order_number": "ORD-2026-000001",
        "customer_name": "Sara Alaoui",
        "phone": "+212600000000",
        "city": "Agadir",
        "total": "1780.00",
        "created_at": "2026-11-05T22:15:05.000000Z"
      }
    ]
  },
  "errors": null
}
```

- Unlike prices elsewhere, the revenue figures here are numbers.
- Revenue only counts paid orders, which means delivered ones.
- `revenue_last_30_days` always has 30 entries, with 0 for days with no sales.
- `top_products` leaves out cancelled orders and has at most 5 entries.
- `low_stock` lists products with fewer than 5 units.
- `pending_over_24h` lists orders that have been pending for at least 24 hours.
- If one part of the stats fails, it comes back as `null` and the others still load, so handle `null` in each section.

### Products

| Method and path | Purpose | Success |
|---|---|---|
| `GET /api/v1/admin/products` | List all products, including hidden ones. Takes the same filters as the [public list](#get-apiv1products), and `category` also accepts hidden categories. | `200`, paginated |
| `POST /api/v1/admin/products` | Create | `201` |
| `GET /api/v1/admin/products/{slug}` | Show one, even if hidden | `200` |
| `PATCH /api/v1/admin/products/{slug}` | Update (`PUT` works the same way) | `200` |
| `DELETE /api/v1/admin/products/{slug}` | Delete. Past orders keep their copy of the name and price. | `204` |

Fields for create and update:

| Field | Create | Update | Rules |
|---|---|---|---|
| `category_id` | Required | Optional | An existing category ID |
| `name` | Required | Optional | Max 255 characters |
| `price` | Required | Optional | At least 0, up to 2 decimals |
| `stock` | Required | Optional | Whole number, at least 0 |
| `image` | Required | Optional | jpg, jpeg, png or webp, max 2 MB |
| `compare_at_price` | Optional | Optional | The old price, shown as a discount. Must be above `price`. On an update, that's the `price` in the same request, or the current price if none is sent. |
| `description`, `notes` | Optional | Optional | Text |
| `sku` | Optional | Optional | Max 100 characters |
| `sort_order` | Optional, default 0 | Optional | Whole number, at least 0. Lower numbers are listed first. |
| `is_active` | Optional, default `true` | Optional | Boolean. `false` hides the product. |
| `is_featured` | Optional, default `false` | Optional | Boolean |

The slug is generated from the name when the product is created, with a suffix like `-2` if it's taken. It doesn't change if the product is renamed.

**Uploading an image:** send `multipart/form-data`. For updates, send a `POST` with an extra `_method=PATCH` field, because many PHP setups don't read files from a real `PATCH` request.

```js
const form = new FormData();
form.append('_method', 'PATCH');
form.append('stock', '12');
form.append('image', file);

await api.post(`/api/v1/admin/products/${slug}`, form);
```

### Categories

| Method and path | Purpose | Success |
|---|---|---|
| `GET /api/v1/admin/categories` | List all, including hidden ones | `200`, paginated |
| `POST /api/v1/admin/categories` | Create | `201` |
| `GET /api/v1/admin/categories/{slug}` | Show one | `200` |
| `PATCH /api/v1/admin/categories/{slug}` | Update (`PUT` works the same way) | `200` |
| `DELETE /api/v1/admin/categories/{slug}` | Delete. Returns `409` if it still has products. | `204` |

| Field | Create | Update | Rules |
|---|---|---|---|
| `name` | Required | Optional | Max 255 characters, must be unique |
| `description` | Optional | Optional | Text |
| `image` | Optional | Optional | jpg, jpeg, png or webp, max 2 MB |
| `is_active` | Optional, default `true` | Optional | Boolean. `false` hides the category and all its products from the public API. |
| `sort_order` | Optional, default 0 | Optional | Whole number, at least 0. Lower numbers are listed first. |

### Orders

| Method and path | Purpose | Success |
|---|---|---|
| `GET /api/v1/admin/orders` | List orders with their items | `200`, paginated |
| `GET /api/v1/admin/orders/{orderNumber}` | Show one, with items and status history | `200` |
| `PATCH /api/v1/admin/orders/{orderNumber}/status` | Change the status | `200` |

Filters for the list:

| Query parameter | Notes |
|---|---|
| `q` | Searches the order number, customer name and phone |
| `status` | `pending`, `confirmed`, `shipped`, `delivered` or `cancelled` |
| `payment_status` | `unpaid` or `paid` |
| `city` | Partial match |
| `date_from`, `date_to` | Dates, such as `2026-11-01`. Both are inclusive. |
| `older_than_hours` | Orders placed at least this many hours ago |
| `sort` | `newest` (default), `oldest`, `total_desc` or `total_asc` |

Request body for changing the status:

```json
{ "status": "confirmed", "note": "Confirmed by phone" }
```

`note` is optional, with a maximum of 255 characters. The response is the full [Order](#order), including the new history entry.

These are the only changes allowed:

| From | Can move to |
|---|---|
| `pending` | `confirmed`, `cancelled` |
| `confirmed` | `shipped`, `cancelled` |
| `shipped` | `delivered` |
| `delivered` | Nothing |
| `cancelled` | Nothing |

Anything else returns `422`, with a message like `Cannot change order status from confirmed to pending.`

- Moving to `cancelled` restores the stock.
- Moving to `delivered` sets `payment_status` to `paid`.

## Data objects

### Category

| Field | Type | Notes |
|---|---|---|
| `id` | integer | |
| `name`, `slug` | string | |
| `description` | string or null | |
| `image_path` | string or null | Full image URL, despite the name |
| `is_active` | boolean | |
| `sort_order` | integer | |
| `products_count` | integer | Only in category responses, not when nested in a product. Public lists count active products only, and admin responses count all of them. |
| `created_at`, `updated_at` | string | |

### Product

| Field | Type | Notes |
|---|---|---|
| `id`, `category_id` | integer | |
| `name`, `slug` | string | |
| `category` | [Category](#category) | |
| `description`, `notes`, `sku` | string or null | |
| `price` | string | Such as `"890.00"` |
| `compare_at_price` | string or null | The old price, to show a discount |
| `stock` | integer | |
| `sort_order` | integer | |
| `image_path` | string | Full image URL, despite the name |
| `is_active`, `is_featured` | boolean | |
| `created_at`, `updated_at` | string | |

### Order

| Field | Type | Notes |
|---|---|---|
| `id` | integer | |
| `order_number` | string | Such as `ORD-2026-000001` |
| `idempotency_key` | string | |
| `customer_name`, `phone`, `email`, `city`, `address` | string | |
| `note` | string or null | |
| `items` | array | See below |
| `items_count` | integer | |
| `history` | array | Only when showing or updating one order. See below. |
| `subtotal`, `shipping_cost`, `total` | string | Shipping is currently always `"0.00"` |
| `status` | string | `pending`, `confirmed`, `shipped`, `delivered` or `cancelled` |
| `payment_status` | string | `unpaid` or `paid` |
| `confirmation_sent_at`, `whatsapp_opened_at` | string or null | |
| `created_at`, `updated_at` | string | |

Each entry in `items` is a copy made at purchase time, so it doesn't change if the product does:

| Field | Type | Notes |
|---|---|---|
| `order_id` | integer | |
| `product_id` | integer or null | Null if the product was deleted |
| `product_name` | string | |
| `unit_price`, `line_total` | string | |
| `quantity` | integer | |

Each entry in `history`, oldest first:

| Field | Type | Notes |
|---|---|---|
| `id` | integer | |
| `from_status`, `to_status` | string | |
| `note` | string or null | |
| `user_id` | integer or null | Null when the system made the change, such as an automatic cancellation |
| `changed_by` | string or null | The admin's name |
| `created_at` | string | |
