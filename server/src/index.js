import { LIMITS, validateSubmission } from "./validate.js";
import { ADMIN_PAGE } from "./adminPage.js";
import { WEB_APP, MANIFEST, SERVICE_WORKER } from "./webApp.js";
import { ICON_512, ICON_180 } from "./icons.js";

// How the free tier stays free:
//
// /catalogue is the only endpoint the app calls regularly, and it answers with
// a long Cache-Control so Cloudflare's edge serves nearly all of it without
// ever reaching the Worker or D1. The database is touched on submission and on
// review — both rare, both human-paced. There is no polling anywhere.

const CATALOGUE_MAX_AGE = 300;      // 5 min at the edge
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX = 5;                 // submissions per IP per hour

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === "OPTIONS") return cors(new Response(null, { status: 204 }));

    try {
      // HEAD as well as GET: uptime checks and caches issue HEAD, and a 404
      // there looks like an outage.
      if ((request.method === "GET" || request.method === "HEAD") && pathname === "/catalogue") {
        return cors(await getCatalogue(env));
      }
      if (request.method === "POST" && pathname === "/submit") {
        return cors(await postSubmission(request, env));
      }
      // The web app: the free way onto anyone's phone. Same catalogue, no
      // App Store, and it installs to the home screen from Safari's Share menu.
      if (request.method === "GET" && (pathname === "/" || pathname === "/index.html")) {
        return html(WEB_APP);
      }
      if (request.method === "GET" && pathname === "/manifest.webmanifest") {
        return cors(new Response(MANIFEST, {
          headers: { "content-type": "application/manifest+json", "cache-control": "public, max-age=3600" },
        }));
      }
      if (request.method === "GET" && pathname === "/sw.js") {
        // Never cached: a stale service worker outlives every other mistake.
        return new Response(SERVICE_WORKER, {
          headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "no-cache" },
        });
      }
      if (request.method === "GET" && (pathname === "/icon-512.png" || pathname === "/icon-180.png")) {
        return png(pathname === "/icon-512.png" ? ICON_512 : ICON_180);
      }
      if (pathname === "/admin") {
        return new Response(ADMIN_PAGE, {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      if (pathname === "/admin/pending") {
        return cors(await listForReview(request, env, url));
      }
      if (request.method === "POST" && pathname === "/admin/review") {
        return cors(await review(request, env));
      }
      if (request.method === "POST" && pathname === "/admin/edit") {
        return cors(await edit(request, env));
      }
      if (request.method === "POST" && pathname === "/admin/create") {
        return cors(await create(request, env));
      }
      // Never let a 404 stick in the edge cache: add a route later and the
      // old "not found" would keep being served for minutes.
      return cors(json({ error: "Not found" }, 404, { "cache-control": "no-store" }));
    } catch (err) {
      // Never leak internals to a client; the message goes to the tail log.
      console.error("unhandled", err && err.stack ? err.stack : err);
      return cors(json({ error: "Something went wrong." }, 500));
    }
  },
};

// MARK: catalogue

async function getCatalogue(env) {
  const { results } = await env.DB.prepare(
    `SELECT id, name, author, payload, reviewed_at, ip_hash
       FROM submissions
      WHERE status = 'approved'
      ORDER BY reviewed_at DESC
      LIMIT 500`
  ).all();

  // Origin comes from how the row got here, not from the author's display
  // name — otherwise anyone typing "Amy" would land in the curated section.
  const recipes = (results || []).map((row) => ({
    id: row.id,
    approvedAt: row.reviewed_at,
    origin: row.ip_hash ? "community" : "curated",
    ...JSON.parse(row.payload),
  }));

  return json(
    { version: 1, count: recipes.length, recipes },
    200,
    {
      // stale-while-revalidate means a submission going live is never blocking:
      // the edge keeps serving instantly while it refreshes underneath.
      "cache-control": `public, max-age=${CATALOGUE_MAX_AGE}, stale-while-revalidate=3600`,
    }
  );
}

// MARK: submissions

async function postSubmission(request, env) {
  const raw = await request.text();
  if (raw.length > LIMITS.body) {
    return json({ error: "That recipe is too large." }, 413);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return json({ error: "Could not read that as JSON." }, 400);
  }

  const result = validateSubmission(parsed);
  if (!result.ok) return json({ error: result.error }, 400);

  const ipHash = await hashIP(request, env);
  const since = Date.now() - RATE_WINDOW_MS;
  const recent = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM submissions WHERE ip_hash = ? AND created_at > ?`
  ).bind(ipHash, since).first();

  if (recent && recent.n >= RATE_MAX) {
    return json(
      { error: "That's a lot of recipes at once. Try again in an hour." },
      429
    );
  }

  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO submissions (id, status, name, author, payload, created_at, ip_hash)
     VALUES (?, 'pending', ?, ?, ?, ?, ?)`
  ).bind(
    id,
    result.recipe.name,
    result.recipe.author,
    JSON.stringify(result.recipe),
    Date.now(),
    ipHash
  ).run();

  return json({ ok: true, id, status: "pending" }, 201);
}

/// Salted so the table never holds a reversible address — it exists only to
/// count submissions per person per hour.
async function hashIP(request, env) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const salt = env.IP_SALT || "churn-dev-salt";
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

// MARK: review

function authorised(request, env) {
  const header = request.headers.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "");
  return Boolean(env.ADMIN_TOKEN) && token === env.ADMIN_TOKEN;
}

async function listForReview(request, env, url) {
  if (!authorised(request, env)) return json({ error: "Not authorised." }, 401);
  const status = url.searchParams.get("status") || "pending";
  if (!["pending", "approved", "rejected"].includes(status)) {
    return json({ error: "Unknown status." }, 400);
  }

  const { results } = await env.DB.prepare(
    `SELECT id, status, name, author, payload, created_at, review_note
       FROM submissions WHERE status = ? ORDER BY created_at DESC LIMIT 200`
  ).bind(status).all();

  return json({
    status,
    submissions: (results || []).map((row) => ({
      id: row.id,
      status: row.status,
      name: row.name,
      author: row.author,
      createdAt: row.created_at,
      reviewNote: row.review_note,
      recipe: JSON.parse(row.payload),
    })),
  });
}

async function review(request, env) {
  if (!authorised(request, env)) return json({ error: "Not authorised." }, 401);

  const body = await request.json().catch(() => null);
  if (!body || typeof body.id !== "string") {
    return json({ error: "Which submission?" }, 400);
  }
  if (!["approved", "rejected"].includes(body.status)) {
    return json({ error: "Status must be approved or rejected." }, 400);
  }

  const note = typeof body.note === "string" ? body.note.slice(0, 300) : null;
  const res = await env.DB.prepare(
    `UPDATE submissions SET status = ?, reviewed_at = ?, review_note = ? WHERE id = ?`
  ).bind(body.status, Date.now(), note, body.id).run();

  if (!res.meta || res.meta.changes === 0) {
    return json({ error: "No submission with that id." }, 404);
  }
  return json({ ok: true, id: body.id, status: body.status });
}

// MARK: helpers

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}

function html(body) {
  return new Response(body, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}

function png(base64) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return new Response(bytes, {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=604800, immutable",
    },
  });
}

function cors(response) {
  const out = new Response(response.body, response);
  out.headers.set("access-control-allow-origin", "*");
  out.headers.set("access-control-allow-headers", "content-type, authorization");
  out.headers.set("access-control-allow-methods", "GET, POST, OPTIONS");
  return out;
}

/// Editing runs submitted content through exactly the same validator as a new
/// submission — an admin edit is not a reason to lower the bar, and it keeps
/// one definition of what a valid recipe is.
async function edit(request, env) {
  if (!authorised(request, env)) return json({ error: "Not authorised." }, 401);

  const body = await request.json().catch(() => null);
  if (!body || typeof body.id !== "string") {
    return json({ error: "Which recipe?" }, 400);
  }
  const result = validateSubmission(body.recipe);
  if (!result.ok) return json({ error: result.error }, 400);

  const res = await env.DB.prepare(
    `UPDATE submissions SET name = ?, author = ?, payload = ? WHERE id = ?`
  ).bind(
    result.recipe.name,
    result.recipe.author,
    JSON.stringify(result.recipe),
    body.id
  ).run();

  if (!res.meta || res.meta.changes === 0) {
    return json({ error: "No recipe with that id." }, 404);
  }
  return json({ ok: true, id: body.id, recipe: result.recipe });
}

/// Write a recipe straight into the catalogue. This is the curated path — it
/// skips the queue because the only caller holding the admin token is you.
async function create(request, env) {
  if (!authorised(request, env)) return json({ error: "Not authorised." }, 401);

  const body = await request.json().catch(() => null);
  const result = validateSubmission(body && body.recipe);
  if (!result.ok) return json({ error: result.error }, 400);

  const status = body.status === "pending" ? "pending" : "approved";
  const id = crypto.randomUUID();
  const now = Date.now();

  await env.DB.prepare(
    `INSERT INTO submissions (id, status, name, author, payload, created_at, reviewed_at, ip_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`
  ).bind(
    id, status, result.recipe.name, result.recipe.author,
    JSON.stringify(result.recipe), now, status === "approved" ? now : null
  ).run();

  return json({ ok: true, id, status }, 201);
}
