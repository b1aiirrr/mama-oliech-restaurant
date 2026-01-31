# Mama Oliech Restaurant Website

A vibrant, mobile-first website for **Mama Oliech Restaurant** — a legendary Kenyan dining institution on Marcus Garvey Road, Kilimani, Nairobi.

## Features

- **Hero** — Full-width food imagery, headline “The Taste of Lake Victoria in the Heart of Nairobi”, primary CTA “View Menu” and secondary “Visit Us”
- **Menu** — Digital menu with filterable categories (Fish, Accompaniments, Drinks). Card layout, KES prices, informational only
- **Our Story** — Narrative about Mama Oliech’s legacy, cultural importance, and community
- **Visit Us** — Address, opening hours, embedded Google Map, “Get Directions” CTA
- **Footer** — Restaurant name, tagline, social links, copyright

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Fonts:** DM Serif Display (headlines), Source Sans 3 (body)

## Design

- **Colors:** Terracotta (warmth), deep greens (tradition), lake blues (Lake Victoria)
- **Typography:** Bold, friendly headlines; clean, readable body text
- **Layout:** Mobile-first, responsive (tablet & desktop)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build & Deploy

```bash
npm run build
npm start
```

## Customization

- **Menu:** Edit `src/data/menu.ts` to add or change dishes and prices.
- **Map:** Replace `EMBED_SRC` in `src/components/VisitUs.tsx` with your exact Google Maps embed URL for Mama Oliech’s location.
- **Social links:** Update `socialLinks` in `src/components/Footer.tsx` with real Facebook, Instagram, and Twitter URLs.
- **Images:** Hero and Our Story use Unsplash placeholders. Replace with your own high-resolution food and restaurant photos for production.

## SEO & Accessibility

- Semantic HTML and heading structure
- Meta title, description, and keywords (Kenyan food, tilapia, Nairobi restaurants)
- Alt text on images, ARIA labels where needed
- High-contrast text, tap-friendly buttons (min 44px), readable font sizes

## License

Private — Mama Oliech Restaurant.
