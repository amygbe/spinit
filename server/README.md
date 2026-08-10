# Churn server

**Live:** https://spinit.ameliagracebell.workers.dev
- `/` — the web app, for anyone with the link
- `GET /catalogue` — what the iPhone app reads
- `/admin` — your review queue

The web app is the free route onto other people's phones: no App Store, no
$99, no review. On iOS, Share → Add to Home Screen gives it an icon and a
full-screen launch. It's served by this same Worker, so there's nothing extra
to deploy or pay for.

The shared catalogue: approved recipes anyone can browse, and a submission
queue only you can approve from.

Runs on Cloudflare Workers + D1, on the free plan.

## Why this can't surprise you with a bill

Two deliberate choices:

- **The read path barely touches the server.** `/catalogue` answers with
  `max-age=300, stale-while-revalidate=3600`, so Cloudflare's edge serves
  almost every request without waking the Worker or querying D1. The app never
  polls.
- **The free plan fails instead of charging.** No credit card is required, and
  [exceeding a free-tier limit makes requests error rather than triggering
  overage billing](https://developers.cloudflare.com/workers/platform/pricing/).
  Overages only exist once you deliberately upgrade to the $5/month paid plan.

For scale: the free tier covers roughly 150M row reads and 3M row writes a
month. A submission is one write. Reviewing is one write. You will not
approach these numbers.

**The one rule:** don't add a paid binding to `wrangler.toml` without meaning
to. Everything currently in there is free.

## First-time setup

You'll need a free Cloudflare account. No card.

```bash
cd server
npx wrangler login          # opens a browser
npx wrangler d1 create churn
```

That prints a `database_id`. Paste it into `wrangler.toml`, replacing
`PLACEHOLDER_REPLACED_BY_WRANGLER`.

Create the tables and set your secrets:

```bash
npx wrangler d1 execute churn --remote --file=./schema.sql
npx wrangler secret put ADMIN_TOKEN    # invent a long random string
npx wrangler secret put IP_SALT        # any long random string
npx wrangler deploy
```

`ADMIN_TOKEN` is the only thing standing between the internet and your review
queue. Make it long, keep it in your password manager, and never commit it.

## Reviewing submissions

Open <https://spinit.ameliagracebell.workers.dev/admin>, paste your admin
token, and approve or reject. It's built to work from a phone with nothing
installed.

Nothing appears in the catalogue until you approve it — which is also the
easiest way to satisfy Apple's user-generated-content rules, since no
unmoderated content is ever visible.

## Working on it locally

```bash
npm install
npx wrangler d1 execute churn --local --file=./schema.sql
npx wrangler dev
```

Local secrets come from `.dev.vars` (gitignored). The local admin token is
`local-dev-token`.

## The API

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/catalogue` | — | Approved recipes. Cached at the edge. |
| POST | `/submit` | — | Submit a recipe. Lands as `pending`. |
| GET | `/admin` | — | Review page (asks for the token). |
| GET | `/admin/pending?status=` | Bearer | List by status. |
| POST | `/admin/review` | Bearer | `{id, status: approved\|rejected, note?}` |

## What's guarded, and how it was checked

Every one of these was exercised against a local Worker, not just intended:

- **Submitted JSON is rebuilt, not stored.** `validate.js` constructs a fresh
  object from known fields; unknown keys are dropped. Verified by submitting a
  `sneakyField` and confirming it never reached the database.
- **Rate limited** to 5 submissions per address per hour → `429`.
- **Body capped** at 16 KB → `413`.
- **Admin endpoints reject** a missing or wrong token → `401`.
- **Pending recipes stay invisible** — approving is what publishes them.
- **Addresses are never stored.** Only a salted SHA-256 prefix, which exists
  solely to count submissions per hour.

## Still to do

The iPhone app does not talk to this yet. That's the next piece: a Catalogue
screen that fetches `/catalogue`, a "save to my shelf" action, and a submit
flow that posts the recipe with a display name.
