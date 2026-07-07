# Deploying to Cloudflare (Pages + D1 + Access)

This app runs entirely on Cloudflare: **Pages** hosts the frontend and API (as
Pages Functions), and **D1** (Cloudflare's built-in database) stores the data.
Everything below is done by clicking through the Cloudflare dashboard — no
command line required. It should take about 15 minutes the first time.

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

## Step 2 — Load the schema and seed data

1. Open the `product-ltv-db` database you just created.
2. Click the **Console** tab (this lets you run SQL directly, no install
   needed).
3. Open [`d1/schema.sql`](./d1/schema.sql) in this repo on GitHub, copy the
   entire file, paste it into the Console, and click **Execute**.
4. Open [`d1/seed.sql`](./d1/seed.sql), copy the entire file, paste it into
   the Console, and click **Execute**. This loads the 30 starting
   initiatives.
5. Verify it worked: in the Console, run `SELECT COUNT(*) FROM initiatives;`
   — it should return `30`.

## Step 3 — Create the Pages project

1. In the Cloudflare dashboard, go to **Workers & Pages** → **Create** →
   **Pages** → **Connect to Git**.
2. Authorize Cloudflare to access your GitHub account if prompted, then
   select the `ProductLTVApp` repository.
3. Pick the branch to deploy (use `main` once this work is merged, or the
   feature branch directly if you want to try it before merging).
4. On the build settings screen, set:
   - **Framework preset**: None
   - **Build command**: `npm run install:all && npm run build`
   - **Build output directory**: `client/dist`
   - Leave **Root directory** as `/`
5. Click **Save and Deploy**. The first deploy will fail to load data (the
   database isn't connected yet) — that's expected, continue to Step 4.

## Step 4 — Connect the database to the site

1. Open your new Pages project → **Settings** → **Functions** (or
   **Bindings**, depending on dashboard version).
2. Find **D1 database bindings** and click **Add binding**.
3. Set **Variable name** to exactly `DB` (this must match exactly).
4. Set **D1 database** to `product-ltv-db`.
5. Save — do this for both the **Production** and **Preview** environments
   if the screen shows separate tabs for each.
6. Cloudflare will tell you a new deployment is needed for the binding to
   take effect. Go to the **Deployments** tab and click **Retry deployment**
   (or push any small commit to GitHub — every push auto-deploys from here
   on).

At this point, visiting your Pages URL (shown at the top of the project
page, looks like `https://product-ltv-app-xyz.pages.dev`) should show the
working app with all 30 initiatives.

## Step 5 — Restrict access to your team (Cloudflare Access)

Right now the URL is public to anyone who has it. To require a login:

1. Go to [one.dash.cloudflare.com](https://one.dash.cloudflare.com) (this is
   Cloudflare's separate "Zero Trust" dashboard). The first time you visit,
   it'll ask you to pick a team name — any name works, it's just an internal
   label.
2. Go to **Access** → **Applications** → **Add an application** →
   **Self-hosted**.
3. Under **Application domain**, enter your Pages URL from Step 4 (e.g.
   `product-ltv-app-xyz.pages.dev`).
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
the `*.pages.dev` one, that's **Pages project → Custom domains**, also a
few clicks.

## If a deploy fails

Check the **Deployments** tab → click the failed deployment → **View build
log**. The most common causes:
- Build command typo — double check it matches Step 3 exactly.
- Missing D1 binding — re-check Step 4, the variable name must be `DB`
  (capital letters, exact match).
