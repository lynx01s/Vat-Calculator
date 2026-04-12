# VAT Price Calculator v2 — THB ฿

A modern Next.js app for breaking down prices with VAT using divisor **1.2084**.

## Formula
```
Before VAT = Price incl. VAT ÷ 1.2084
VAT amount = Price incl. VAT − Before VAT
```

## Features
- Pre-loaded ฿15,000–฿18,000 range (฿500 steps)
- Add custom amounts with optional labels
- **Inline edit** any row's price or label
- **Copy** individual row or all rows (tab-separated)
- **Export CSV** and **Excel (.xlsx)**
- **Sort** by any column (click header)
- **Filter/search** rows live
- **Dark mode** toggle
- Toast notifications for every action
- Keyboard shortcut: `Enter` to add row

## Deploy to Vercel

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/vat-calculator.git
git push -u origin main
```

Then go to [vercel.com/new](https://vercel.com/new), import your repo, and click **Deploy**.

## Local Dev

```bash
npm install
npm run dev
# http://localhost:3000
```

## Stack
- Next.js 14 (App Router) · TypeScript
- Tailwind CSS · Framer Motion
- SheetJS (xlsx) for Excel export
- IBM Plex Sans + IBM Plex Mono (Google Fonts)
