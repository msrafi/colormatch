# Deploy Color Finder

**Live URL:** https://msrafi.github.io/colormatch/

Static app at repo root (`index.html`, `scripts/`, `styles/`, `data/`).

## GitHub Pages (recommended)

1. Repo **public** (or GitHub Pro for private Pages).
2. **Settings → Pages → Build and deployment → Source:** **GitHub Actions**.
3. Push to `master` — workflow `.github/workflows/deploy-colorfinder.yml` deploys the repo root.
4. Or **Actions → Deploy Color Finder → Run workflow**.

## Netlify / Cloudflare

- **Publish directory:** repository root (where `index.html` is)
- **Build command:** none

## Local test

```bash
python3 -m http.server 8080
# open http://localhost:8080
```
