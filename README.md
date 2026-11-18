# vort2x.org

The VorT2x website, served by GitHub Pages at https://vort2x.org. Plain HTML,
CSS and JavaScript with no build step.

| Path | What |
|---|---|
| `index.html` | Home page |
| `documentation.html` | The docs. Apps link to `#streaming-using-sidecar` and `#hardware-video-decoding`, keep those ids |
| `blog/` | Blog index and posts, one HTML file each, with hero images |
| `assets/site.css`, `assets/site.js` | Shared styles and behaviour (particle vortex, typing terminal, copy buttons, scroll animations) |
| `assets/og.svg` → `og.png` | Link-preview image (1200x630) |
| `404.html`, `robots.txt`, `sitemap.xml`, `CNAME` | GitHub Pages extras |

The header and footer are repeated in every page; change them in all of them.
A new blog post needs a card in `blog/index.html` and a line in `sitemap.xml`.
