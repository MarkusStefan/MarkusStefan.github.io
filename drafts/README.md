# Website draft

Separate homepage and research-report drafts. Existing pages and their build are unchanged. This draft has not been published or committed.

- Homepage: `/drafts/`
- Research report: `/drafts/research/`
- Source copy: `home.md` and `research/report.md`
- Shared design and interaction: `draft.css` and `alignment.js`
- Source and figure provenance: `evidence.json`

From the repository root, run `node drafts/build.mjs` to regenerate both HTML pages. Serve the repository root with `python3 -m http.server 5173`, then visit `http://localhost:5173/drafts/`. Root-relative links require serving the repository rather than opening the HTML directly.

The figures are unchanged copies of the active thesis figures. The recovery bars transcribe the thesis counts. The mass/friction interaction is explicitly conceptual and does not generate benchmark data. No experiments were run.

The report uses the updated ten-representation-by-three-learner control study, not the older ten-policy-seed study in the current public-page source. The thesis PDF is not copied: its final public URL and release-ready version remain to be selected. Thesis completion follows the author's instruction; the draft does not claim degree conferral, conference submission, or acceptance.

Both draft pages carry `noindex, nofollow`. This is indexing guidance, not access control. Review drafts before including this directory in a public deployment; the existing deployment workflow uploads the repository root.
