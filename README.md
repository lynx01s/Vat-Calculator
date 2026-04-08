# VAT Price Calculator — THB ฿

A modern Next.js app for breaking down prices into **before VAT**, **VAT amount**, and **total incl. VAT** using a divisor of **1.2084**.

## Features

- Pre-loaded price range: **฿15,000 – ฿18,000** (in ฿500 steps)
- Add custom amounts manually at any time
- Summary cards for totals
- Animated row additions / deletions
- Fully responsive

## Formula

```
Price before VAT = Price incl. VAT ÷ 1.2084
VAT amount       = Price incl. VAT − Price before VAT
```

---

## Deploy to Vercel via GitHub

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/vat-calculator.git
git push -u origin main
```

### Step 2 — Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import** next to your GitHub repo
3. Leave all settings as-is (Vercel auto-detects Next.js)
4. Click **Deploy**

That's it — Vercel handles everything automatically.

---

## Local Development

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (animations)
- **Google Fonts** — Syne + DM Sans + DM Mono
