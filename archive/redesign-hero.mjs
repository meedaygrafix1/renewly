import { readFile, writeFile } from 'node:fs/promises';
const path = 'dist/index.html';
let html = await readFile(path, 'utf8');
const start = html.indexOf('      <div class="hero-art"');
const end = html.indexOf('    </section>', start);
if (start < 0 || end < 0) throw new Error('Original hero not found');
html = html.slice(0, start) + `      <div class="universe-wrap">
        <div class="universe-card">
          <div class="universe-heading"><span><i></i> Your subscription universe</span><span class="universe-number">↻ 01</span></div>
          <div class="globe-stage" role="group" aria-label="Interactive globe of subscription logos" aria-describedby="globe-help">
            <div class="globe-grid" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span></div>
            <div class="globe-tiles" aria-hidden="true"></div>
            <div class="globe-center" aria-hidden="true"><span>↻</span></div>
            <div class="globe-crosshair crosshair-one" aria-hidden="true">+</div><div class="globe-crosshair crosshair-two" aria-hidden="true">+</div>
          </div>
          <div class="universe-toolbar"><p id="globe-help"><span class="drag-symbol" aria-hidden="true">↔</span> Give your world a spin</p><div class="globe-controls"><button type="button" data-globe="left" aria-label="Rotate globe left" title="Rotate globe left">←</button><button type="button" data-globe="pause" aria-label="Pause globe rotation" title="Pause globe rotation" aria-pressed="false"><span class="pause-glyph" aria-hidden="true">Ⅱ</span></button><button type="button" data-globe="right" aria-label="Rotate globe right" title="Rotate globe right">→</button></div></div>
        </div>
        <div class="universe-receipt"><span class="receipt-check" aria-hidden="true">✓</span><div><strong>A whole world of subscriptions.</strong><p>Finally, in your orbit.</p></div><span class="receipt-star" aria-hidden="true">✳</span></div>
        <p class="brand-context">Your favourites, all together. Logos shown for illustration.</p>
      </div>
` + html.slice(end);
html = html.replace('<link rel="stylesheet" href="styles.css">', '<link rel="stylesheet" href="styles.css">\n  <link rel="stylesheet" href="hero.css">');
html = html.replace('<script src="script.js" defer></script>', '<script src="script.js" defer></script>\n  <script type="module" src="globe.js"></script>');
html = html.replace('<div class="eyebrow"><span class="status-dot"></span> A LITTLE LESS ADMIN. A LOT MORE CLARITY.</div>', '<div class="hero-kicker"><span class="status-dot"></span> A little order in your subscription universe</div>');
html = html.replace('Streaming, storage, that thing you forgot about.<br class="desktop-break"> Bring every subscription into one happy place.<br class="desktop-break"> Meet Renewly. Your new peace of mind.', 'Your music. Your movies. That free trial you forgot.<br class="desktop-break"> Bring every recurring payment into one happy place.<br class="desktop-break"> A little less chaos. A lot more clarity.');
html = html.replace('Meet your new happy place <span', 'Meet Renewly <span');
html = html.replace('<p class="hero-note"><span aria-hidden="true">✓</span> Know what’s next. Enjoy what’s now.</p>', '<div class="hero-proof"><span><i aria-hidden="true">✓</i> Track every subscription</span><span><i aria-hidden="true">✓</i> Stay ahead of renewals</span></div>');
await writeFile(path, html);
