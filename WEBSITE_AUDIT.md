# Website audit — 13 October 2026

The site has a sensible foundation: static HTML, small vanilla scripts, consistent styling, semantic main/navigation elements, visible keyboard focus, lazy-loaded card images, and a working CV download. Keep that architecture. The priorities are accessibility, clearer professional positioning, and reliable content publishing.

## Evidence and limits

Reviewed the five primary pages, their shared CSS/JS, content manifests, generator, templates, and relevant CI/deployment workflows. Retrieved the deployed homepage, shared stylesheet/script, three manifests, and CV page; all seven files matched the local copies byte for byte. Checked selected deployed paths over HTTP and ran the content generator in an isolated temporary checkout using the existing dependencies.

Browser validation was unavailable: the Playwright connector could not find Chrome, the in-app browser was unavailable, and native Edge access was denied. Layout, interaction, and contrast observations below are source-derived, not rendered browser measurements. No Lighthouse score, Core Web Vitals, or measured performance improvement is claimed. No application source was changed.

## Fix first

| Priority | Finding | Evidence | Recommended change |
| --- | --- | --- | --- |
| Critical | Reduced-motion users lose visible content. | `assets/css/styles.css:58–68`: `.reveal` starts at `opacity: 0`; its animation restores visibility, but the reduced-motion rule disables every animation. The header, intro, timeline, footer, and generated cards use this class. | Make content visible by default, or explicitly restore `opacity: 1` and `transform: none` for reduced motion. Also disable smooth scrolling for that preference. Verify every primary page with reduced motion enabled. |
| High | The documented blog publishing workflow does not work. | README directs authors to `blog/posts/`; `build-content.js:13` reads `blogs/`. The isolated build exited successfully without producing `blog/quiet-animations.html`, and created an unrelated `/blogs/` index instead. The expected deployed post URL returned 404. The generator writes `index.json`, while the blog renderer reads `manifest.json`. | Align the input directory, output URLs, and manifest schema. Decide how local articles and Medium entries coexist before changing generation, so existing Medium entries are preserved. Fail the build when expected outputs are missing. |
| High | Research/project cards promise destinations they do not provide. | The knowledge-graph entry has `thumbnail: "/"`, which returns HTML rather than an image, and `link: "#"`, whose click is deliberately canceled. “Cardiovascular Imaging” opens the general GitHub profile. | Use an intentional thumbnail and an explicit “In progress” status for unavailable work. Use a non-link card when there is no destination. Link the imaging project to a specific repository, research page, or accurate explanation of availability. |
| Medium | A deployed secondary page has broken styling. | `/docs/` returns 200 but links to `/css/styles.css`, which returns 404. Main pages also reference `/favicon.ico`, which returns 404; their SVG favicon exists. | Correct the documents stylesheet path or remove the obsolete page from publication. Remove the unused alternate favicon reference or provide that file. |
| Medium | CI gives misleading confidence. | `.github/workflows/ci.yml:29–31` labels a step “Check for syntax errors” but only prints HTML filenames. Manifest validation checks JSON syntax and silently skips absent files. | Validate required files, local asset references, manifest fields, and generated post URLs. Add a small rendered smoke check for reduced motion and mobile navigation when browser tooling is available. |

## Improve the professional story

The homepage currently leads with “About Me” and “AI fanatic,” then a chronological education/work timeline. It gives visitors little reason to choose a particular research result or project next. The visible heading does not identify you by name.

Recommended homepage order:

1. **Name and role:** “Markus Köfler — Data Scientist & ML Researcher,” followed by a specific sentence about your actual current interests. Confirm current education/employment before updating dates or roles.
2. **Clear next steps:** visible links to selected research, projects, and the CV/contact information.
3. **Selected work:** two or three strongest entries, each explaining the problem, your contribution, and the available evidence or artifact.
4. **Short biography and experience:** retain the timeline below the work, with older school history moved to the CV if it distracts from current work.

The research page has two entries with the same title and description but different publication links. Distinguish their actual contributions and add authorship, venue/year, and publication type. Separate published abstracts, ongoing work, and other projects with explicit statuses. Do not invent metrics or present an abstract as a full paper.

The projects page gives nine items equal prominence, including coursework. Lead with selected substantive work and group exercises separately. Replace compressed descriptions such as “CV + ML” with a clear problem/contribution sentence. A project detail page can explain methods, limitations, your role, and links without lengthening every card. Keep any outcome claims tied to existing evidence.

The CV lists R twice. Standardize capitalization, degree labels, institution names, and date formatting across the homepage, CV, and PDF. The PDF URL returned 200; its content was not audited for consistency.

## Design and usability

- **Mobile header: likely overflow.** Below 768px, the CSS still places the monogram, five unwrapped navigation links, and four social icons in one grid row. Reduce this to a compact layout or place navigation on its own row; move social links to the footer on narrow screens. Validate at 320, 375, and 768px. This is a source-based risk, not a measured rendering result.
- **Keep monochrome branding; strengthen hierarchy.** Use monospace for labels/navigation if desired, and consider a readable proportional font for longer descriptions. Prioritize name, role, selected work, and contact visually.
- **Preserve scientific image meaning.** Card images use a fixed 200px crop and grayscale until hover. Cropping can hide diagrams, and grayscale can remove meaningful color distinctions. Use contained images where needed and retain color where it carries information.
- **Make unavailable work intentional.** Placeholder images become “UNDER CONSTRUCTION” cards with a pulsing “DANGER” button. This draws attention away from research and inserts a button inside a linked card. Prefer an explicit status and a neutral illustration; any playful feature should have a deliberate location.
- **Simplify the footer.** Contact details are useful; the clock, shortcut overlay, theme control, copy controls, and separators compete with them. Give contact a clear hierarchy and show a descriptive theme label/state.

## Accessibility, discovery, and robustness

- Add a skip link and `aria-current="page"` to the active navigation link.
- Improve small copy/social control target sizes and expose copy success through an accessible status message. Clipboard failures are currently swallowed.
- The shortcut overlay stays `aria-hidden="true"` when opened and lacks explicit Escape dismissal/focus handling. Make it an accessible dialog, or remove it. Global single-character shortcuts should be disableable/remappable or scoped appropriately; ignore editable targets and modifier combinations.
- Add descriptive page titles using your name, page-specific meta descriptions, canonical URLs, and social preview metadata. The primary pages currently lack these. Add a sitemap for intended public pages; do not claim search-ranking gains without evidence.
- Blog/research/project grids are populated exclusively through JavaScript. Rendering cards during the existing build would provide content before script execution and a more resilient experience. This does not require a framework.
- Fetch handlers should check HTTP status and present useful visitor-facing errors. Current messages expose author instructions, including input paths that do not match the generator.
- Project links are all labeled “on GitHub,” although the bachelor thesis points to Google Drive. Match accessible labels and destination text to the actual artifact.

## Performance and maintenance

Source asset sizes show worthwhile image work: the imaging project thumbnail is approximately 1.3 MiB, the Airbnb thumbnail 836 KiB, and the skin-cancer thumbnail 572 KiB. Produce appropriately sized WebP/AVIF variants where they preserve image quality; add intrinsic dimensions and responsive sources. This is a payload recommendation, not a measured latency result.

The repository tracks 227 files under `assets/node_modules`, while deployment uploads the entire repository as its artifact. Publish only intended website files, exclude dependencies and authoring inputs, and stop tracking generated dependency directories. The current `.gitignore` contains only `*test*`, which could also hide useful future test files.

Headers/footers repeat across primary pages and templates. A small shared build template can prevent content drift if these elements are edited regularly. `assets/urls/site.json` already centralizes social/contact values but the primary HTML hardcodes them. Reuse the existing build rather than introducing a new framework.

## Recommended sequence

1. Fix reduced-motion visibility, publishing paths, invalid/non-specific cards, and broken asset references.
2. Rework the homepage around name, focus, selected work, and clear next steps; distinguish research contributions and statuses.
3. Validate mobile navigation, keyboard behavior, both themes, and image presentation in a browser.
4. Add metadata, image variants, build-time card output, meaningful CI validation, and a clean deployment artifact.

The first two steps should provide the largest immediate improvement in reliability and how clearly the site communicates your work.
