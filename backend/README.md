# Lume Perfums Backend

REST API for the Lume Perfums online shop, built with Laravel 13. It serves the public catalog, takes cash-on-delivery orders that the customer sends through WhatsApp, and powers the admin dashboard.

- **API reference:** [docs/API.md](docs/API.md)
- **Postman collection:** [docs/lume-perfums.postman_collection.json](docs/lume-perfums.postman_collection.json)

## Requirements

- PHP 8.3 or newer, with the `pdo_sqlite` or `pdo_mysql` extension
- Composer
- SQLite or MySQL

## Install

```bash
cd backend
composer setup
```

This installs the dependencies, creates `.env` from `.env.example`, generates the app key and creates the database tables. By default it uses SQLite. To use MySQL, first copy `.env.example` to `.env` and set `DB_CONNECTION=mysql` and the other `DB_*` values.

Then check these values in `.env`:

| Variable | What it's for |
|---|---|
| `SHOP_ADMIN_NAME`, `SHOP_ADMIN_EMAIL`, `SHOP_ADMIN_PASSWORD` | The admin account. **Required:** seeding stops with an error if any of them is empty. |
| `SHOP_MAIL_ADDRESS` | Receives new order emails. Change the example value to your own address. |
| `SHOP_WHATSAPP_NUMBER` | The number customers send their order to, digits only. Change the example value to your own number. |
| `FRONTEND_URL` | Your frontend's address. CORS and password reset links use it. |

## Create and seed the database

```bash
php artisan db:seed
php artisan storage:link
```

This creates the admin account, the categories and the products. `storage:link` makes product images reachable by URL.

To start over, run `php artisan migrate:fresh --seed`. **It deletes all the data in the database, including orders.**

## Run it

The shop needs three processes. Run each one in its own terminal:

```bash
php artisan serve        # the API, on http://127.0.0.1:8000
php artisan queue:work   # sends the order confirmation and reminder emails
php artisan schedule:work # sends reminders and cancels abandoned orders
```

With the default `MAIL_MAILER=log`, emails are written to `storage/logs/laravel.log` instead of being sent.

If you change `.env` or the code, restart `queue:work`, because it keeps the old version in memory.

### Scheduled tasks

These run every 5 minutes:

| Command | What it does |
|---|---|
| `orders:send-payment-reminders` | Emails customers who haven't opened WhatsApp 30 minutes after ordering |
| `orders:cancel-unpaid --hours=1 --unopened` | Cancels pending orders whose WhatsApp link wasn't opened within 1 hour, and restores the stock |
| `orders:cancel-unpaid --hours=24` | Cancels orders still pending after 24 hours, and restores the stock |

In production, run `php artisan schedule:run` from cron every minute, and keep `queue:work` running under a process manager such as Supervisor.

## Run the tests

```bash
composer test
```

Tests run on an in-memory SQLite database set in `phpunit.xml`, so they don't need any setup.

> **Protect your data:** use `composer test` rather than `php artisan test`, because it clears the config cache first. If you ran `php artisan config:cache`, the tests can ignore `phpunit.xml` and connect to the database in your `.env`, and `RefreshDatabase` would then delete everything in it.

The tests focus on where a bug would cost money:

| File | What it protects |
|---|---|
| `OrderPricingTest` | Totals are calculated on the server, so customers can't choose their own price |
| `OrderStockTest` | Stock can't be oversold, and is taken and given back exactly once |
| `OrderIdempotencyTest` | Retrying a request doesn't create a duplicate order |
| `OrderStatusTest` | Orders can only move through the allowed statuses |
| `AdminAccessTest` | Every admin route refuses guests and non-admins |
| `HiddenProductsTest` | Hidden products stay out of the public API, even when the catalog is cached |

Two customers buying the last unit at the same moment isn't covered. It relies on database row locks, which SQLite ignores, so test it by hand on MySQL.

## How orders work

1. The customer places an order. The server calculates the total from database prices and reduces the stock straight away.
2. The API returns a WhatsApp link with the order filled in, and the customer sends that message to the shop.
3. An admin moves the order along: `pending` → `confirmed` → `shipped` → `delivered`. Delivery marks it as paid, because payment is cash on delivery.
4. Orders can be cancelled while `pending` or `confirmed`, and cancelling restores the stock.

## Logs

Written to `storage/logs/`:

| Location | Contents |
|---|---|
| `orders/` | Orders placed, status changes, failed stock checks |
| `admin/` | Logins, failed logins, price changes |
| `queue/` | Background jobs that failed after their last try |
| `laravel.log` | Everything else |
