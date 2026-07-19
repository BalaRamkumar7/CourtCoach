# CourtCoach website

Static marketing + research site. Plain HTML — no build step, no dependencies.

```
website/
├─ index.html                  landing page
└─ research/
   ├─ index.html               research hub
   ├─ methodology.html         how metrics are fact-checked
   ├─ shooting.html
   ├─ passing.html
   └─ dribbling.html
```

## Preview locally
```
cd website
python3 -m http.server 8000
# open http://localhost:8000
```

## Publish (pick one)

**Netlify Drop (fastest, ~60s)** — go to https://app.netlify.com/drop and drag the
`website` folder onto the page. Live instantly at a `*.netlify.app` URL. Sign in (free)
to keep it and rename it.

**Vercel** — `cd website && npx vercel` (follow prompts), or drag the folder at vercel.com.

**Netlify / Cloudflare Pages via git** — connect this repo; `netlify.toml` already points
the publish directory at `website/`, so it deploys on every push.

**Custom domain (courtcoach.com)** — once the domain is purchased, add it in your host's
domain settings and point DNS as instructed. This is the only step that costs money.
