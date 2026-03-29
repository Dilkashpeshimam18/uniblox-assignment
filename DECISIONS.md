# Design Decisions

## Decision: In-Memory Store as Singleton

**Context:** The assignment specifies no database is needed and an in-memory store is acceptable.

**Options Considered:**
- Option A: Use a plain JavaScript object/module-level variable
- Option B: Use a class-based singleton injected into services
- Option C: Use an external store like Redis for future scalability

**Choice:** Class-based singleton (`InMemoryStore`) exported as `store`

**Why:** A class-based singleton makes the data shape explicit (typed fields), is easy to reset in tests (just clear maps/arrays), and separates concerns cleanly. Plain module variables work but become messy. Redis adds unnecessary complexity for this scope.

---

## Decision: Discount Code Generation is Admin-Triggered, Not Automatic

**Context:** The spec says "every nth order gets a coupon code" but also has a separate admin API to generate the code.

**Options Considered:**
- Option A: Auto-generate the code immediately when the nth order is placed
- Option B: Set a flag when the nth order is placed; admin explicitly generates the code

**Choice:** Option B — admin-triggered generation with a `pendingDiscountGeneration` flag

**Why:** The spec explicitly lists "Generate a discount code if the condition above is satisfied" as an admin API. Making it manual gives the business control over when codes are released, prevents automated abuse, and mirrors real-world admin workflows. The checkout response includes `newDiscountEligible: true` to signal the UI.

---

## Decision: Single-Use Discount Codes

**Context:** Need to define code reuse policy.

**Options Considered:**
- Option A: Codes can be used multiple times (percentage off, no limit)
- Option B: Each generated code is single-use and marked as `isUsed` after checkout
- Option C: Codes expire after a time window

**Choice:** Option B — single-use codes

**Why:** Single-use codes prevent a single code from being shared indefinitely across users, which would undermine the nth-order reward system. The `isUsed` flag is set atomically during checkout before the order is committed to the store.

---

## Decision: Cart Scoped to User ID (No Auth)

**Context:** Real auth would require JWT/sessions; the assignment focuses on cart/checkout logic.

**Options Considered:**
- Option A: No user concept — single global cart
- Option B: Full JWT authentication
- Option C: Simple userId string passed in requests, validated against cart ownership

**Choice:** Option C — userId string without real auth

**Why:** The userId validates cart ownership (preventing user A from checking out user B's cart) without the overhead of a full auth system. The frontend uses a hardcoded `guest-user` ID to keep the demo simple. In production this would be replaced with a verified JWT claim.

---

## Decision: Vite + React for Frontend (not Next.js)

**Context:** Need a React frontend to demonstrate the full stack.

**Options Considered:**
- Option A: Next.js (SSR, file-based routing)
- Option B: Vite + React SPA
- Option C: Create React App (deprecated)

**Choice:** Vite + React SPA

**Why:** This is a client-side demo app with no SEO requirements. Vite provides near-instant HMR and fast builds without the complexity of SSR setup. The Vite proxy configuration neatly avoids CORS issues in development by forwarding `/api` requests to the Express backend.

---

## Decision: REST over GraphQL/tRPC

**Context:** API design for cart, checkout, and admin endpoints.

**Options Considered:**
- Option A: GraphQL — single endpoint, flexible queries
- Option B: tRPC — end-to-end type safety with TypeScript
- Option C: REST with Express

**Choice:** REST with Express

**Why:** REST is the most universally understood pattern and best demonstrates the API design clearly. The endpoints map naturally to resources (cart, products, checkout, admin). GraphQL would be beneficial in a larger app with complex data fetching needs; tRPC would require sharing types between frontend and backend (worth it in a monorepo, overkill here).

---

## Decision: Order Number vs Order ID for Human-Facing References

**Context:** Orders have both a UUID (`id`) and a sequential `orderNumber`.

**Options Considered:**
- Option A: Use only UUID for all references
- Option B: Use sequential integer order numbers for display, UUID for internal lookups

**Choice:** Option B — both UUID and sequential order number

**Why:** UUIDs are opaque to users ("your order abc123-...") while sequential numbers are human-friendly ("Order #7"). The sequential number also makes the nth-order logic trivial to communicate: "Every 5th order" maps directly to `orderNumber % nthOrder === 0`.
