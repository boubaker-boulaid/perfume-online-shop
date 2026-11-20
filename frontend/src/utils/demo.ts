// The public demo of the shop (a portfolio project), switched on at build time with
// VITE_DEMO_MODE=true. It matches the backend's SHOP_DEMO (backend/README.md, "Demo mode").
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

// The demo's admin account, shown on the login page so visitors can try the admin.
// The backend must have the same one in SHOP_ADMIN_EMAIL and SHOP_ADMIN_PASSWORD.
export const DEMO_ADMIN =
  DEMO_MODE && import.meta.env.VITE_DEMO_ADMIN_EMAIL && import.meta.env.VITE_DEMO_ADMIN_PASSWORD
    ? { email: import.meta.env.VITE_DEMO_ADMIN_EMAIL, password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD }
    : null
