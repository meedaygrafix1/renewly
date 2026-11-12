# Renewly marketing website

A responsive, buildless HTML/CSS/JavaScript marketing page for the Renewly mobile app (Figma file `kp5K1NhUCRFixa4lgUtpd2`, page `189:7530`).

Serve `dist/` with any static HTTP server (`node preview.mjs` serves it at http://127.0.0.1:4173). No package installation or build step is required. Brand logos are CSS masks, so they only render over HTTP, not from `file://`.

## Design

Minimal, product-first: one neutral palette with the Renewly purple as the single accent, Inter for all type, and the product itself (an HTML-built home screen, notification and feature UI) as the imagery. No decorative glyphs, rotated stickers or hard drop shadows.

Sections: hero with phone product shot, logo strip, feature bento, how it works, FAQ, closing call to action.

## Notes

- All CTAs carry `data-cta`. Set `APP_URL` at the top of `dist/script.js` to the real app, store or waitlist link and every CTA uses it; while it is empty they scroll to `#features`.
- `og:image` is a relative path (`assets/og.jpg`). Some link previews need an absolute URL, so change it to the full address once the domain is known.
- Photos are CSS backgrounds marked `lazy-bg`; they load about 600px before they scroll into view.
- No app-store availability, pricing, customer counts or testimonials are claimed.
- Amounts and dates are illustrative. Brand logos come from Simple Icons (CC0, see `dist/assets/brands/SOURCES.md`) and illustrate categories only; they imply no affiliation.
- Scroll reveals and the hero entrance respect `prefers-reduced-motion`.
- The previous playful design is archived in `archive/dist-playful-v1/`.
