# 🪳 RoachVault

> Survival is the only strategy.

Personal finance tracker PWA. Upload a monthly CSV, get a full dashboard — no server, no persistence, no accounts. Everything runs in the browser.

---

## Features

- **Drag-and-drop CSV upload** — drop your monthly tracking file, data never leaves the device
- **Double-counting filter** — rows with `CC Bill Payment` in Notes are excluded from Total Expenses automatically
- **Category normalization** — `Savings/Investments` and variants map to `Savings / Investment`
- **Fee extraction** — Notes column scanned for "fee" keyword to tally total transaction costs
- **Survival Overview** — Total Expenses / Savings / Fees at a glance
- **Spending Pie** — category breakdown via Recharts
- **Daily Burn** — line chart of daily spend over the month
- **Indestructible Ledger** — full transaction list, newest first; CC-excluded rows visually muted
- **PWA / installable** — works offline, add to home screen on iOS/Android

---

## CSV Schema

The app expects this exact column order (header row required):

```text
Date, Category, Description, Amount, Payment Method, Notes
```

Example row:

```text
2026-05-04, Other, UB Credit Card Payment, 5000.00, Maya/ E-Wallet, CC Bill Payment - avoid counting in total expense
```

---

## Tech Stack

| Tool | Library |
| --- | --- |
| Framework | React + TypeScript (Vite) |
| Styling | Tailwind CSS v3 — dark mode, terminal aesthetic |
| CSV parsing | PapaParse |
| Charts | Recharts |
| Icons | Lucide-React |
| PWA | vite-plugin-pwa + Workbox |

---

## Getting Started

Requires **Node.js 22+** (Vite 8 / rolldown dependency).

```bash
# if using nvm
nvm use 22

npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
```

---

## Project Structure

```text
src/
├── components/
│   ├── UploadZone.tsx       # drag-and-drop landing screen
│   ├── SurvivalOverview.tsx # stat cards (expenses / savings / fees)
│   ├── SpendingPie.tsx      # recharts pie by category
│   ├── DailyBurn.tsx        # recharts line chart daily spend
│   └── Ledger.tsx           # transaction table, newest first
├── hooks/
│   └── useVaultData.ts      # CSV parse, cleanse, aggregate
├── lib/
│   └── csvSchema.ts         # Transaction type, category normalizer
├── App.tsx
└── index.css                # Tailwind + CSS vars
```

---

## Data Processing Logic

All processing happens in `src/hooks/useVaultData.ts`:

1. Parse CSV with PapaParse (`header: true`)
2. Normalize categories via `CATEGORY_MAP` in `csvSchema.ts`
3. Flag rows where `Notes` contains `"CC Bill Payment"` → excluded from `totalExpenses`
4. Scan `Notes` for `"fee"` keyword → extract numeric value → add to `totalFees`
5. Aggregate `byCategory` (for pie) and `byDay` (for line chart), both excluding CC payments
6. Return transactions sorted newest-first

---

## PWA

Built with `vite-plugin-pwa`. After `npm run build`:

- `dist/sw.js` — Workbox service worker
- `dist/manifest.webmanifest` — app manifest

To verify: `npx vite preview` → Chrome DevTools → Application tab → check SW registration and installability prompt.
