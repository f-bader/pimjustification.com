# pimjustification.com

A reason for access. A static Entra ID PIM justification generator with 600 pre-authored English reasons across six sarcasm levels.

## Run locally

From the repository root:

```sh
python -m http.server 4173 --bind 127.0.0.1 --directory site
```

Open http://127.0.0.1:4173. Use a web server rather than opening the HTML file directly, because the JavaScript uses native modules. Python is only a local preview convenience; the deployed site needs no runtime or build process.

## Behavior and editing

- Every page load starts at level 0 (Off). Moving the slider or selecting **Another** draws a new reason from that level.
- Each level has its own shuffled collection; all 100 appear before repeating, with no immediate repeat across collection boundaries.
- **Copy justification** copies only the reason. If clipboard access is unavailable, the text is selected for manual copying. Clipboard access normally requires HTTPS or localhost.
- Light/dark colors follow the system. There are no external assets, analytics, cookies, saved preferences, or network requests beyond the site's own files.
- Edit `site/justifications.js` to change content. Keep 100 unique, complete, paste-ready reasons in each of its six arrays: Off, Subtle, Dry, Pointed, Heavy, Fully sarcastic. Level 0 is professional; humor above it stays workplace-safe.
- Layout and appearance live in `site/index.html` and `site/styles.css`; behavior lives in `site/app.js` and `site/shuffle.js`.

## Checks

Use Node.js 22 or newer; no package installation is needed:

```sh
node --test
```

Tests cover content counts and uniqueness, independent shuffle cycles, boundary repeats, initial state, level changes, clipboard success/failure and pending-copy races. The interaction tests use a minimal DOM harness; they do not replace browser testing.

Before publishing, also check mobile/desktop layouts, both system themes, keyboard navigation, live-region announcements with a screen reader, reduced motion, and copy on an actual HTTPS page.

## GitHub Pages and the existing domain

The workflow checks pull requests and deploys `site/` after successful checks on pushes to `main` or manual runs on `main`. Only website files are published. See [GitHub's custom workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

1. In the repository's **Settings → Pages**, choose **GitHub Actions** as the source.
2. Set **Custom domain** to `pimjustification.com` and save before changing DNS. The included `site/CNAME` records the intended domain, but Actions deployments require this repository setting; the file alone does not configure it.
3. At your existing DNS provider, point the apex (`@`) to the following four **A** records. Replace conflicting website records, preserving unrelated email and verification records:

   ```text
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```

4. Optionally add a **CNAME** record for `www` pointing to `f-bader.github.io` (no repository path). GitHub redirects it to the configured apex domain.
5. Push the site to `main` and check the deployment under **Actions**. Once DNS and the certificate are ready, enable **Enforce HTTPS** under Pages. DNS/certificate provisioning can take up to 24 hours.

These values and the required custom-domain setting follow [GitHub's domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site). No new domain purchase is needed. Repository settings and DNS are not changed by the local implementation.

The assets use relative paths, so the same files also work under `https://f-bader.github.io/pimjustification.com/` before the custom domain is configured.
