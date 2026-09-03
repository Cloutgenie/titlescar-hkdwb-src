# TitleScar

A $39 one-click diminished-value demand pack for US drivers after a not-at-fault wreck. The car is repaired or quoted, Carfax still shows a hit, and the at-fault insurer lowballs, denies, or will not say what to upload.

TitleScar is **not a law firm** and does **not** give legal advice. The 17c worksheet is a Georgia-origin **floor**, not the ask. Comps beat the formula.

This is not Holdback or any other product.

## What you get after pay

A ZIP with five PDFs:

1. State-aware **third-party** diminished-value demand letter (public claim practice only — no invented case law)
2. Filled **17c worksheet** with the math shown
3. **Comps capture sheet** — 3 slots for local clean vs accident-history listings
4. **Evidence checklist** — invoice, photos, Carfax, police report
5. **Lowball counter** + one-page DOI outline + small-claims outline

If the buyer marks first-party (own insurer) and the state is **not Georgia**, TitleScar does **not** write a first-party DV demand. It writes the at-fault / third-party letter and notes that first-party DV is often dead outside GA (Carson).

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev -- --port 43123
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

## Checkout

Prefer **Stripe Checkout** when `STRIPE_SECRET_KEY` is set. Otherwise the landing CTA uses `WHOP_CHECKOUT_URL`.

```
WHOP_CHECKOUT_URL=https://whop.com/checkout/plan_N7b5sNmw9nsFr
STRIPE_SECRET_KEY=sk_live_...          # optional; wins if present
HOLD_UNLOCK_KEY=a-long-random-string   # required for the Whop return URL
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### Whop return URL

The public checkout URL does not prove payment by itself. After you deploy, set the Whop checkout redirect (or post-purchase link) to:

```
https://YOUR_DOMAIN/pack?k=THE_SAME_HOLD_UNLOCK_KEY
```

`/pack` stays locked unless Stripe reports a paid session **or** `k` matches `HOLD_UNLOCK_KEY`. There is no demo unlock.

### Stripe

Create a Checkout session from `/start`. Success lands on `/pack?session_id={CHECKOUT_SESSION_ID}`. The pack API retrieves the session and only builds the ZIP when `payment_status` is `paid`.

## Deploy

Push this Origin repo and link it on Vercel (App Router, default build). Add the env vars above. Turn **off** Vercel Deployment Protection so a stranger can open the URL, pay, and download.
