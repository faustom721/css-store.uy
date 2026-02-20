# CSS Store Uruguay

Landing page for CSS Store — online store of socks (medias) and sportswear in Uruguay.

## Tech Stack

- [Astro](https://astro.build) — Web framework
- [MDX](https://mdxjs.com) — Blog content
- [Splide](https://splidejs.com) — Carousel/slider
- RSS feed and sitemap

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/fausto-lab/css-store.uy.git
   cd css-store.uy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:4321`

## Project Structure

```
src/
├── components/     # Astro components (Header, Footer, etc.)
├── content/
│   ├── blog/       # MD/MDX blog posts
│   └── data/
│       └── main.json   # Site content (product, SEO, footer, etc.)
├── layouts/
├── pages/
└── styles/
```

## Content

- **main.json** — Product info, hero slides, features, testimonials, FAQ, footer, SEO metadata
- **Blog** — Markdown/MDX in `src/content/blog/`

## Build & Deploy

```bash
npm run build
npm run preview   # Preview production build
```

## License

MIT
