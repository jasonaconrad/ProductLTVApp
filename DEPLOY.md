# Deploying to Cloudflare (Workers + D1 + Access)

This app runs entirely on Cloudflare: a **Worker** serves the frontend and the
API together, and **D1** (Cloudflare's built-in database) stores the data.
Everything below is done by clicking through the Cloudflare dashboard and
GitHub's website — no terminal required. It should take about 15 minutes the
first time.

You'll need a Cloudflare account (free tier is enough) and this repo pushed to
GitHub (it already is).

---

## Step 1 — Create the database

1. Log into [dash.cloudflare.com](https://dash.cloudflare.com).
2. In the left sidebar, find **D1 SQL Database** (it may be under a "Storage &
   Databases" or "Workers & Pages" section depending on your dashboard
   layout — use the search bar at the top if you can't find it).
3. Click **Create Database**.
4. Name it `product-ltv-db` and click **Create**.
5. On the database's page, copy the **Database ID** shown near the top (a
   long string like `a1b2c3d4-...`). You'll need it in Step 3 — paste it
   somewhere temporary (a notes app, an email draft) for now.

## Step 2 — Load the schema and seed data

1. Still on the `product-ltv-db` page, click the **Console** tab (this lets
   you run SQL directly, no install needed).
2. Open [`d1/schema.sql`](./d1/schema.sql) in this repo on GitHub, copy the
   entire file, paste it into the Console, and click **Execute**.
3. Open [`d1/seed.sql`](./d1/seed.sql), copy the entire file, paste it into
   the Console, and click **Execute**. This loads the 30 starting
   initiatives.
4. Verify it worked: in the Console, run `SELECT COUNT(*) FROM initiatives;`
   — it should return `30`.

## Step 3 — Point the app at your database

The app needs to know your database's ID. This is one value in one file,
edited directly on GitHub's website (no git, no terminal):

1. Go to this repo on GitHub and open the file `wrangler.toml`.
2. Click the pencil (✏️) icon in the top right of the file view to edit it.
3. Find the line `database_id = "local-dev-id"` and replace `local-dev-id`
   with the Database ID you copied in Step 1 (keep the quotes).
4. Scroll down and click **Commit changes** directly to the `main` branch.

## Step 4 — Create the Worker

1. In the Cloudflare dashboard, go to **Workers & Pages** → **Create** →
   look for an option to **Connect to Git** / **Import a repository**.
2. Authorize Cloudflare to access your GitHub account if prompted, then
   select the `ProductLTVApp` repository and the `main` branch.
3. On the build settings screen, set:
   - **Build command**: `npm run install:all && npm run build`
   - Leave other settings at their defaults — the app's own `wrangler.toml`
     tells Cloudflare where the static files and API code live.
4. Click **Save and Deploy**.

If the build log shows an error about a missing database or `database_id`,
double check Step 3 was saved correctly and re-deploy (**Deployments** tab →
**Retry deployment**).

At this point, visiting your Worker's URL (shown at the top of the project
page, looks like `https://product-ltv-app.<your-subdomain>.workers.dev`)
should show the working app with all 30 initiatives.

## Step 5 — Restrict access to your team (Cloudflare Access)

Right now the URL is public to anyone who has it. To require a login:

1. Go to [one.dash.cloudflare.com](https://one.dash.cloudflare.com) (this is
   Cloudflare's separate "Zero Trust" dashboard). The first time you visit,
   it'll ask you to pick a team name — any name works, it's just an internal
   label.
2. Go to **Access** → **Applications** → **Add an application** →
   **Self-hosted**.
3. Under **Application domain**, enter your Worker's URL from Step 4 (e.g.
   `product-ltv-app.<your-subdomain>.workers.dev`).
4. Add a policy: set the action to **Allow**, and add a rule
   **Include → Emails ending in → `@paychex.com`**.
5. Save.

Now anyone visiting the site has to verify their `@paychex.com` email (a
one-time code sent to their inbox, no password needed) before they can see
anything.

---

## After the first deploy

Every push to the connected branch on GitHub automatically redeploys the
site — no further manual steps. If you ever want a custom domain instead of
the `*.workers.dev` one, that's **your Worker → Settings → Domains &
Routes**, also a few clicks.

## If a deploy fails

Check the **Deployments** tab → click the failed deployment → **View build
log**. The most common causes:
- Build command typo — double check it matches Step 4 exactly.
- Wrong or missing database ID — re-check Step 3; the value must be the
  exact Database ID from your D1 database's page, in quotes.
