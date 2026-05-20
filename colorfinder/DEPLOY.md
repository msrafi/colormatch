# Deploy Color Finder (free static hosting)

This app is static HTML/CSS/JS. Any host that serves files over HTTPS works.

**Publish folder:** `colorfinder` (this directory), not the repo root.

---

## Option A — Netlify (easiest, no Git required)

1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the **`colorfinder`** folder onto the page.
3. Netlify gives you a URL like `https://random-name.netlify.app`.

**With Git:** New site → Import from Git → repo `msrafi/colormatch` → **Base directory:** `colorfinder` → **Build command:** (leave empty) → **Publish directory:** `.` → Deploy.

---

## Option B — Cloudflare Pages (free)

1. [https://dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → Create → Pages → Connect to Git.
2. Select `colormatch`.
3. **Build settings:**
   - Framework preset: None
   - Build command: *(empty)*
   - Build output directory: `colorfinder`
4. Deploy. URL: `https://<project>.pages.dev`

---

## Option C — Vercel (free)

1. [https://vercel.com/new](https://vercel.com/new) → Import `msrafi/colormatch`.
2. **Root Directory:** click Edit → set to `colorfinder`.
3. Framework: Other (no build).
4. Deploy.

---

## Option D — GitHub Pages (free, uses your existing repo)

1. Push this repo to GitHub (`msrafi/colormatch`).
2. On GitHub: **Settings → Pages → Build and deployment → Source:** **GitHub Actions**.
3. Push to `master` (or run the workflow manually under Actions).
4. The workflow `.github/workflows/deploy-colorfinder.yml` publishes the `colorfinder` folder.
5. Site URL: `https://msrafi.github.io/colormatch/`  
   (username/org and repo name must match your GitHub account.)

---

## Option E — Surge.sh (CLI, free)

```bash
npm install -g surge
cd colorfinder
surge . your-colorfinder.surge.sh
```

---

## Before you deploy

1. Commit and push your latest changes.
2. Test locally (modules need a real server, not `file://`):

   ```bash
   cd colorfinder
   python3 -m http.server 8080
   ```

   Open `http://localhost:8080`

---

## Notes

- **No build step** — deploy the folder as-is.
- The app loads thread colors from `scripts/colorpalette.js` (included).
- Users pick photos from their device; nothing is uploaded to a server.
