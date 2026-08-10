# Spin It

A recipe app for the Ninja Creami — keep your own shelf of recipes, rate your
spins, and share the good ones to a community catalogue.

**Use it:** [amybell.info/spinit](https://amybell.info/spinit)

## What's here

- `Churn/` — native iOS app (SwiftUI, iOS 17+). The Xcode project keeps its
  original working name.
- `server/` — the entire backend: one Cloudflare Worker + a D1 database.
  Also serves the installable web app (`src/webApp.js`) so anyone can use
  Spin It from a phone browser, no install needed.
- `design/` — early prototype and design artifacts.
- `tools/` — project generation and sanity checks (`tools/check.sh`).

## How it works

A recipe and an opinion of it are different objects: the recipe (name,
ingredients, method) is shareable; your rating, spin history, and notes never
leave your device. Sharing to the catalogue is a deliberate, separate action,
and every submission goes through a moderation queue before it's public.

The Worker validates every submitted field against an allowlist, rate-limits
by salted IP hash, and serves the catalogue through Cloudflare's edge cache.
