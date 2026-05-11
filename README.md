# Shabd AI — Outreach CRM

A custom-built outreach CRM for Shabd AI. Tracks leads, manages follow-up reminders (Day 5 / Day 10 / Day 20), stores sector-wise email templates, and connects to Supabase for a permanent shared database.

---

## Project structure

```
shabd-crm/
├── index.html              ← Main app (open this in browser)
├── css/
│   └── styles.css          ← All styles
├── js/
│   ├── config.js           ← ⚠️ Fill in YOUR Supabase keys here
│   ├── db.js               ← Database layer (Supabase + localStorage fallback)
│   └── app.js              ← All app logic
├── supabase_setup.sql      ← Run this in Supabase SQL Editor once
└── README.md               ← This file
```

---

## Step 1 — Supabase setup (one time)

1. Go to [supabase.com](https://supabase.com) → your project
2. Click **SQL Editor** → **New query**
3. Paste the contents of `supabase_setup.sql` and click **Run**
4. Go to **Settings → API**
5. Copy:
   - **Project URL** (looks like `https://xyzabc.supabase.co`)
   - **anon / public key** (long JWT string)

---

## Step 2 — Add your keys to config.js

Open `js/config.js` and fill in:

```js
export const CONFIG = {
  SUPABASE_URL: 'https://YOUR-PROJECT.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGci...your-key...',
  SENDER_NAME: 'Your Name Here',
};
```

---

## Step 3 — Deploy to GitHub Pages (one time)

1. Go to [github.com](https://github.com) → your repository (e.g. `shabd-ai/crm`)
2. Upload all files maintaining the folder structure:
   ```
   index.html
   css/styles.css
   js/config.js
   js/db.js
   js/app.js
   ```
3. Go to **Settings → Pages**
4. Source: **Deploy from a branch** → Branch: `main` → Folder: `/ (root)`
5. Click **Save**
6. Your CRM is live at: `https://YOUR-USERNAME.github.io/REPO-NAME/`

---

## Updating the CRM

When you want to change anything:
1. Edit the file locally
2. Go to your GitHub repo → click the file → click the pencil (edit) icon
3. Paste the updated content → click **Commit changes**
4. GitHub Pages auto-deploys in ~30 seconds

---

## How to use

| Feature | How |
|---|---|
| Add lead | Click **Add lead** button (top right) |
| Import leads | Sidebar → **Import CSV** — drag your RocketReach export |
| Auto reminders | Enter "Date email sent" → Day 5, 10, 20 fill automatically |
| Move stage | Open lead → click any stage button, or click the stage dot in Pipeline view |
| Draft email | Click ✉ on any row → pick template → copy to Titan |
| Overdue alerts | Red banner at top + Sidebar → **Overdue reminders** |
| Export | Sidebar → **Export CSV** |
| Add templates | Sidebar → **Email templates** → New template |
| Tokens in templates | `{name}` `{company}` `{sector}` `{sender}` |

---

## Database

- **Supabase** (PostgreSQL) — permanent, shared, backed up daily
- Falls back to browser localStorage automatically if Supabase is not configured
- Connection status shown in the top bar (green = Supabase connected)

---

## Tech stack

- Pure HTML / CSS / JavaScript — no framework, no build step
- Supabase JS client loaded from ESM CDN (no npm needed)
- Google Fonts (DM Sans + Instrument Serif)
- Works in any modern browser

---

*Built for Shabd AI — NSRCEL, IIM Bangalore incubated*
