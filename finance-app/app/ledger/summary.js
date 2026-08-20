// app/ledger/summary.js — Summary & Overview
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStorage } from '../../hooks/useStorage';
import { LColors, EXPENSE_CATS, getExpCat, fmt, fmtDate } from '../../constants';

const L = LColors;

function SummaryCard({ label, value, icon, valueColor }) {
  return (
    <View style={s.card}>
      <Text style={s.cardIcon}>{icon}</Text>
      <Text style={s.cardLabel}>{label}</Text>
      <Text style={[s.cardValue, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function Divider({ label }) {
  return (
    <View style={s.divider}>
      <View style={s.divLine} />
      <Text style={s.divLabel}>{label}</Text>
      <View style={s.divLine} />
    </View>
  );
}

export default function SummaryScreen() {
  const [expenses] = useStorage('ledger-expenses-v1');
  const [debts]    = useStorage('ledger-debts-v1');

  const totalExp  = expenses.reduce((s, e) => s + e.amount, 0);
  const totalOwe  = debts.filter((d) => !d.settled && d.dir === 'owe').reduce((s, d) => s + d.amount, 0);
  const totalOwed = debts.filter((d) => !d.settled && d.dir === 'owed').reduce((s, d) => s + d.amount, 0);
  const net       = totalOwed - totalOwe;

  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthExp  = expenses.filter((e) => e.date.startsWith(thisMonth)).reduce((s, e) => s + e.amount, 0);

  const byCat = EXPENSE_CATS.map((c) => {
    const items = expenses.filter((e) => e.cat === c.id);
    return { ...c, total: items.reduce((s, e) => s + e.amount, 0), count: items.length };
  }).filter((c) => c.count > 0).sort((a, b) => b.total - a.total);
  const maxCat = byCat[0]?.total || 1;

  const openDebts  = debts.filter((d) => !d.settled).sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentExp  = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const isEmpty    = expenses.length === 0 && debts.length === 0;

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.content}>

        {/* Stat cards grid */}
        <View style={s.cardGrid}>
          <SummaryCard label="Total Expenses" value={fmt(totalExp)}  icon="📒" valueColor={L.accent} />
          <SummaryCard label="This Month"     value={fmt(monthExp)}  icon="📅" valueColor={L.brown} />
          <SummaryCard label="You Owe"        value={fmt(totalOwe)}  icon="↑"  valueColor={L.red} />
          <SummaryCard label="Owed to You"    value={fmt(totalOwed)} icon="↓"  valueColor={L.green} />
        </View>

        {/* Net balance banner */}
        <View style={[s.netBanner, {
          backgroundColor: net >= 0 ? L.green + '12' : L.red + '12',
          borderColor:     net >= 0 ? L.green + '44' : L.red + '44',
        }]}>
          <Text style={s.netLabel}>NET BALANCE</Text>
          <Text style={[s.netAmt, { color: net >= 0 ? L.green : L.red }]}>
            {net >= 0 ? '+' : ''}{fmt(net)}
          </Text>
          <Text style={s.netSub}>
            {net >= 0
              ? 'People owe you more than you owe'
              : 'You owe more than you are owed'}
          </Text>
        </View>

        {/* Empty state */}
        {isEmpty && (
          <View style={s.emptyBox}>
            <Text style={s.emptyIcon}>⬡</Text>
            <Text style={s.emptyTxt}>Your ledger is empty</Text>
            <Text style={s.emptySub}>Add expenses and debt notes to see your summary</Text>
          </View>
        )}

        {/* Spending by category */}
        {byCat.length > 0 && (
          <>
            <Divider label="SPENDING BY CATEGORY" />
            {byCat.map((c) => (
              <View key={c.id} style={s.catRow}>
                <Text style={s.catIcon}>{c.icon}</Text>
                <View style={s.catInfo}>
                  <View style={s.catTopRow}>
                    <Text style={s.catName}>{c.label.toUpperCase()}</Text>
                    <Text style={[s.catAmt, { color: c.color }]}>{fmt(c.total)}</Text>
                  </View>
                  <View style={s.barTrack}>
                    <View style={[s.barFill, { width: `${(c.total / maxCat) * 100}%`, backgroundColor: c.color }]} />
                  </View>
                  <Text style={s.catMeta}>
                    {c.count} entr{c.count === 1 ? 'y' : 'ies'} · avg {fmt(c.total / c.count)}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Open debts */}
        {openDebts.length > 0 && (
          <>
            <Divider label="OPEN DEBTS" />
            {openDebts.map((d) => {
              const ac = d.dir === 'owe' ? L.red : L.green;
              return (
                <View key={d.id} style={[s.debtRow, { borderLeftColor: ac }]}>
                  <Text style={[s.debtArrow, { color: ac }]}>{d.dir === 'owe' ? '↑' : '↓'}</Text>
                  <View style={s.debtMain}>
                    <Text style={s.debtPerson}>{d.person}</Text>
                    <View style={s.debtMetaRow}>
                      <View style={[s.tag, { backgroundColor: ac + '18', borderColor: ac + '44' }]}>
                        <Text style={[s.tagTxt, { color: ac }]}>{d.dir === 'owe' ? 'I owe' : 'Owes me'}</Text>
                      </View>
                      <Text style={s.debtDate}>{fmtDate(d.date)}</Text>
                    </View>
                    {d.note ? <Text style={s.debtNote} numberOfLines={1}>· {d.note}</Text> : null}
                  </View>
                  <Text style={[s.debtAmt, { color: ac }]}>{fmt(d.amount)}</Text>
                </View>
              );
            })}
          </>
        )}

        {/* Recent expenses */}
        {recentExp.length > 0 && (
          <>
            <Divider label="RECENT EXPENSES" />
            {recentExp.map((e) => {
              const cat = getExpCat(e.cat);
              return (
                <View key={e.id} style={[s.expRow, { borderLeftColor: cat.color }]}>
                  <Text style={s.expIcon}>{cat.icon}</Text>
                  <View style={s.expMain}>
                    <Text style={s.expDesc} numberOfLines={1}>{e.desc}</Text>
                    <Text style={s.expMeta}>{cat.label} · {fmtDate(e.date)}</Text>
                  </View>
                  <Text style={[s.expAmt, { color: cat.color }]}>{fmt(e.amount)}</Text>
                </View>
              );
            })}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: L.bg },
  content:     { padding: 16, paddingBottom: 60 },

  // Stat cards
  cardGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  card:        { width: '47.5%', backgroundColor: L.surface, borderWidth: 1, borderColor: L.border, borderRadius: 12, padding: 14 },
  cardIcon:    { fontSize: 22, marginBottom: 6 },
  cardLabel:   { color: L.textMut, fontSize: 9, letterSpacing: 2, fontWeight: '700', marginBottom: 4 },
  cardValue:   { color: L.accent, fontSize: 20, fontWeight: '800' },

  // Net banner
  netBanner:   { borderWidth: 1, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 8 },
  netLabel:    { color: L.textMut, fontSize: 9, letterSpacing: 3, fontWeight: '700', marginBottom: 6 },
  netAmt:      { fontSize: 32, fontWeight: '800', marginBottom: 4 },
  netSub:      { color: L.textDim, fontSize: 11, textAlign: 'center' },

  // Empty
  emptyBox:    { alignItems: 'center', paddingVertical: 60 },
  emptyIcon:   { fontSize: 44, marginBottom: 12, color: L.tan },
  emptyTxt:    { color: L.tan, fontSize: 16, fontWeight: '700' },
  emptySub:    { color: L.textMut, fontSize: 12, marginTop: 6, textAlign: 'center' },

  // Divider
  divider:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  divLine:     { flex: 1, height: 1, backgroundColor: L.border },
  divLabel:    { color: L.tan, fontSize: 10, fontWeight: '700', letterSpacing: 2 },

  // Category breakdown
  catRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  catIcon:     { fontSize: 22, width: 28, textAlign: 'center', marginTop: 2 },
  catInfo:     { flex: 1 },
  catTopRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  catName:     { color: L.textDim, fontSize: 12, fontWeight: '700', letterSpacing: .5 },
  catAmt:      { fontSize: 14, fontWeight: '800' },
  barTrack:    { height: 4, backgroundColor: 'rgba(122,92,56,.12)', borderRadius: 2, overflow: 'hidden', marginBottom: 3 },
  barFill:     { height: '100%', borderRadius: 2 },
  catMeta:     { color: L.textMut, fontSize: 10 },

  // Open debts
  debtRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingLeft: 12, marginLeft: -4, borderBottomWidth: 1, borderBottomColor: L.border2, borderLeftWidth: 3 },
  debtArrow:   { fontSize: 20, fontWeight: '800', width: 20, textAlign: 'center' },
  debtMain:    { flex: 1 },
  debtPerson:  { color: L.text, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  debtMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  tag:         { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, borderWidth: 1 },
  tagTxt:      { fontSize: 10, fontWeight: '700' },
  debtDate:    { color: L.textMut, fontSize: 10 },
  debtNote:    { color: L.tan, fontSize: 11, fontStyle: 'italic', marginTop: 2 },
  debtAmt:     { fontSize: 15, fontWeight: '800' },

  // Recent expenses
  expRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingLeft: 12, marginLeft: -4, borderBottomWidth: 1, borderBottomColor: L.border2, borderLeftWidth: 3 },
  expIcon:     { fontSize: 20, width: 24, textAlign: 'center' },
  expMain:     { flex: 1 },
  expDesc:     { color: L.text, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  expMeta:     { color: L.textMut, fontSize: 10 },
  expAmt:      { fontSize: 14, fontWeight: '800' },
});
