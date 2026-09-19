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

## API

The public API is served separately at `https://api.pimjustification.com`. It returns a single randomized justification and does not authenticate to Microsoft Entra ID or authorize access: the optional role is caller-supplied metadata used only to choose a collection.

```sh
curl 'https://api.pimjustification.com/v1/justification?role=Global%20Admin&sarcasmLevel=0'
curl 'https://api.pimjustification.com/v1/justification?role=62e90394-69f5-4237-9190-012177145e10&sarcasmLevel=3'
```

`GET /v1/justification` accepts these optional query parameters:

- `role`: An official Microsoft Entra built-in role name, supported alias, or role template ID. Matching ignores case and repeated whitespace. Omit it for a general justification.
- `sarcasmLevel`: An integer from `0` (Off/professional, the default) through `5` (Fully sarcastic).

The response contains `justification`, `sarcasmLevel`, `sarcasmLabel`, normalized `role` metadata (or `null`), and `collection` (`role` or `general`). The API gives the 13 roles below their own 100-reason collection at every tone; recognized built-in roles outside that list fall back to the general collection. Unknown roles, blank/repeated parameters, and invalid tone values return `400` JSON errors. `GET /v1/roles` lists the complete recognized catalog; `GET /openapi.json` is the live OpenAPI 3.1 document. The API is public, responds to browser CORS preflight, and deliberately sends `Cache-Control: no-store` for randomized justifications.

Tailored roles: Global Administrator (`Global Admin`), Security Administrator (`Security Admin`), Global Reader, Intune Administrator (`Intune Admin`), Privileged Role Administrator, Conditional Access Administrator, Authentication Administrator, Privileged Authentication Administrator, User Administrator, Groups Administrator, Application Administrator, Cloud Application Administrator, and Identity Governance Administrator.

The role catalog in `api/src/roles.js` is a reviewed 2026-09-19 snapshot of [Microsoft's built-in Entra roles reference](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference). When Microsoft changes that catalog, update the snapshot and its review date, then adjust the catalog test deliberately. Tailored text is maintained in `api/src/role-justifications.js` as capability-specific subjects combined with authored tone frames, yielding 100 unique reasons for each role/tone pair.

### API development and deployment

The Worker has no runtime dependencies. Use Node 22 or newer for tests, and Wrangler for local Worker emulation:

```sh
node --test
npx wrangler dev --config api/wrangler.toml --local
```

Production uses the `api.pimjustification.com` Cloudflare Worker Custom Domain. Before the first deployment, add `pimjustification.com` as an active Cloudflare zone and delegate its nameservers; Cloudflare then provisions the API hostname and certificate from `api/wrangler.toml`. Add a least-privilege Workers/zone edit token as the GitHub `CLOUDFLARE_API_TOKEN` secret and its account identifier as `CLOUDFLARE_ACCOUNT_ID`. The API workflow runs tests on pull requests and deploys from `main`; it does not alter the existing GitHub Pages workflow or the static site.

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
