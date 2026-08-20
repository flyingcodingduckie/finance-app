// constants.js — shared across all screens

// ─── Receiptly (dark theme) ──────────────────────────────────────────
export const RColors = {
  bg:       '#0D0D0F',
  surface:  '#111114',
  border:   '#1e1e24',
  border2:  '#1a1a20',
  accent:   '#E8633A',
  text:     '#E0DDD8',
  textDim:  '#888',
  textMuted:'#444',
};

export const RECEIPT_CATS = [
  { id: 'food',          label: 'Food & Drink', icon: '🍜', color: '#E8633A' },
  { id: 'transport',     label: 'Transport',    icon: '🚇', color: '#4A90D9' },
  { id: 'shopping',      label: 'Shopping',     icon: '🛍️', color: '#9B59B6' },
  { id: 'health',        label: 'Health',       icon: '💊', color: '#27AE60' },
  { id: 'entertainment', label: 'Fun',          icon: '🎬', color: '#F39C12' },
  { id: 'utilities',     label: 'Utilities',    icon: '💡', color: '#1ABC9C' },
  { id: 'other',         label: 'Other',        icon: '📌', color: '#7F8C8D' },
];
export const getReceiptCat = (id) => RECEIPT_CATS.find((c) => c.id === id) || RECEIPT_CATS[6];

// ─── Ledger (light/warm theme) ───────────────────────────────────────
export const LColors = {
  bg:      '#faf6ef',
  surface: '#fff',
  border:  'rgba(80,55,30,.14)',
  border2: 'rgba(80,55,30,.08)',
  accent:  '#5c3d1e',
  brown:   '#7a5c38',
  tan:     '#b89c72',
  text:    '#3d2c1a',
  textDim: '#9a7d58',
  textMut: '#c4a882',
  red:     '#c0392b',
  green:   '#27835a',
};

export const EXPENSE_CATS = [
  { id:'food',    icon:'☕', label:'Food',    color:'#b84c2a' },
  { id:'home',    icon:'🏠', label:'Home',    color:'#7a5c38' },
  { id:'transit', icon:'🚌', label:'Transit', color:'#4a6fa5' },
  { id:'health',  icon:'🌿', label:'Health',  color:'#27835a' },
  { id:'leisure', icon:'🎭', label:'Leisure', color:'#8b5e3c' },
  { id:'work',    icon:'💼', label:'Work',    color:'#5c4a8a' },
  { id:'misc',    icon:'📎', label:'Misc',    color:'#7a7060' },
];
export const getExpCat = (id) => EXPENSE_CATS.find((c) => c.id === id) || EXPENSE_CATS[6];

// ─── Shared helpers ──────────────────────────────────────────────────
export const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0);

export const fmtDate = (iso) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

export const todayISO = () => new Date().toISOString().slice(0, 10);
export const uid      = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const groupByMonth = (items) => {
  const map = {};
  [...items].sort((a, b) => new Date(b.date) - new Date(a.date)).forEach((item) => {
    const key = new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'long', year: 'numeric',
    });
    if (!map[key]) map[key] = [];
    map[key].push(item);
  });
  return Object.entries(map).map(([label, items]) => ({ label, items }));
};

export const getDateRange = (preset) => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const end = iso(now);
  if (preset === 'all')  return { from: '', to: '' };
  if (preset === '7d')   { const d = new Date(now); d.setDate(d.getDate() - 6);  return { from: iso(d), to: end }; }
  if (preset === '30d')  { const d = new Date(now); d.setDate(d.getDate() - 29); return { from: iso(d), to: end }; }
  if (preset === 'mtd')  return { from: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`, to: end };
  if (preset === 'ytd')  return { from: `${now.getFullYear()}-01-01`, to: end };
  return { from: '', to: '' };
};
