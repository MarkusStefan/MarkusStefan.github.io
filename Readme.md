# Minimal Black-and-White Personal Site

- Static HTML + vanilla CSS/JS
- Auto-generates blog pages from local markdown in `blog/posts/`
- Research/Projects read from simple JSON manifests

## Develop

- Add markdown files to `blog/posts/` with simple front matter:

```
---
slug: my-post
title: My Post
date: 2025-08-25
thumbnail: /images/placeholder.svg
description: One line.
---

# Heading
Paragraph text.
```

- Build blog HTML and manifests:

```
npm run build
```

- Serve locally (optional):

```
npm run serve
```

Open http://localhost:5173

## Structure
- `/` About
- `/blog/` Grid of posts from `blog/manifest.json` (generated). Clicking opens `blog/<slug>.html`.
- `/research/` Grid from `research/manifest.json`
- `/projects/` Grid from `projects/manifest.json`
- `/cv/` Inline CV with Download button for `cv/CV.pdf`

## Customize
- Update social links in headers
- Replace `images/placeholder.svg`
- Add `cv/CV.pdf`
