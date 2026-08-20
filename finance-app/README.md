# 📱 Finance App — Combined Expo/React Native

One app. Two tools. A single dark home screen lets you choose between **Receiptly** (receipt tracker) and **The Ledger** (expense + debt notes). Each section keeps its own visual identity and tab navigator.

---

## App Structure

```
finance-app/
├── app/
│   ├── _layout.js              Stack root (home + two sections)
│   ├── index.js                Home screen — pick Receiptly or The Ledger
│   ├── receipts/
│   │   ├── _layout.js          Tab bar (dark orange theme)
│   │   ├── index.js            Receipts list — filters, sort, CRUD
│   │   ├── stats.js            Category breakdown + CSV export
│   │   └── budgets.js          Monthly budget limits + progress bars
│   └── ledger/
│       ├── _layout.js          Tab bar (warm cream theme)
│       ├── index.js            Expenses — month groups, CRUD
│       ├── debts.js            Debt notes — owe/owed/settled, net balance
│       └── summary.js          Overview — stat cards, charts, open debts
├── hooks/
│   └── useStorage.js           AsyncStorage persistence hook
├── constants.js                Both themes + category sets + shared helpers
├── app.json                    Expo config
├── eas.json                    EAS build profiles
└── babel.config.js
```

---

## Features

### 🧾 Receiptly (dark theme)
- Add receipts with merchant, amount, category, date, note
- Filter by date preset (All / 7d / 30d / This Month / This Year) + category
- Sort by date or amount
- Stats tab: summary cards + per-category bar chart
- Budgets tab: monthly limits per category with over-budget warnings
- CSV export (share sheet in production build)

### ⬡ The Ledger (warm cream theme)
- Log expenses with category, grouped by month
- Debt notes: track who owes whom with I Owe / They Owe Me direction
- One-tap settle/unsettle debts
- Net balance summary (owed to you minus you owe)
- Summary tab: stat cards, spending breakdown, open debts, recent expenses

---

## Build APK

```bash
# Prerequisites (one-time)
npm install -g expo-cli eas-cli
eas login   # free account at expo.dev

# Build
cd finance-app
npm install
eas build --platform android --profile preview
```

EAS builds in the cloud (~5–10 min) and gives you a `.apk` download link.  
Sideload onto Android: Settings → Security → Install unknown apps.

## Run in Expo Go (instant preview)

```bash
cd finance-app
npm install
npx expo start
# Scan QR with Expo Go app
```

---

## Before Building — Update `app.json`

```json
"android": {
  "package": "com.YOURNAME.financeapp"
}
```

Package names must be globally unique (reverse-domain format).  
Replace app icons by swapping `assets/icon.png` (1024×1024 PNG).

---

## Storage Keys

All data lives locally on-device via AsyncStorage:

| Key | Contents |
|-----|----------|
| `receiptly-receipts-v1` | Receipt entries |
| `receiptly-budgets-v1`  | Monthly budget limits |
| `ledger-expenses-v1`    | Expense entries |
| `ledger-debts-v1`       | Debt notes |
