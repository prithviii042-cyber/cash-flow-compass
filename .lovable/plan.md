

## Problem

The "Failed to fetch" error persists even in a new tab because the Lovable preview runs a **production build** where `import.meta.env.DEV` is `false`. The existing dev bypass in `ProtectedRoute` only works in local development, not in the preview environment. Authentication requests to the backend are failing due to network/CORS restrictions in the preview environment.

## Plan: Remove Authentication Requirement During Development

Since authentication is blocking all development work, I'll **completely bypass authentication** by making `ProtectedRoute` always render its children, regardless of auth state. The auth page and infrastructure will remain intact for when you're ready to re-enable it.

### Changes

1. **`src/components/ProtectedRoute.tsx`** — Remove the `import.meta.env.DEV` check and always return `<>{children}</>` unconditionally. Add a comment marking this as a temporary development bypass.

2. **`src/App.tsx`** — Remove the `/auth` route redirect logic so the app always loads the dashboard directly.

This is a single, minimal change that unblocks all development immediately. When you're ready to re-enable auth (e.g., for production), we simply restore the original `ProtectedRoute` logic.

