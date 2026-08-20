// app/receipts/budgets.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStorage } from '../../hooks/useStorage';
import { RColors, RECEIPT_CATS, fmt } from '../../constants';

const R = RColors;

export default function BudgetsScreen() {
  const [receipts]                = useStorage('receiptly-receipts-v1');
  const [budgets, persistBudgets] = useStorage('receiptly-budgets-v1', {});
  const [draft, setDraft]         = useState({});
  const [saved, setSaved]         = useState(false);

  useEffect(() => { setDraft(budgets); }, [JSON.stringify(budgets)]);

  const thisMonth  = new Date().toISOString().slice(0, 7);
  const monthSpend = (catId) =>
    receipts.filter((r) => r.category === catId && r.date.startsWith(thisMonth))
            .reduce((s, r) => s + r.amount, 0);

  const saveBudgets = () => {
    const cleaned = {};
    Object.entries(draft).forEach(([k, v]) => { const n = parseFloat(v); if (!isNaN(n) && n > 0) cleaned[k] = n; });
    persistBudgets(cleaned);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.intro}>Set monthly spending limits. Tracked against the current calendar month.</Text>
        {RECEIPT_CATS.map((c) => {
          const budget = budgets[c.id];
          const spent  = monthSpend(c.id);
          const pct    = budget ? Math.min((spent / budget) * 100, 100) : 0;
          const over   = budget && spent > budget;
          const warn   = budget && !over && pct > 80;
          return (
            <View key={c.id} style={s.card}>
              <View style={s.cardHead}>
                <View style={[s.iconBox, { backgroundColor:c.color+'22' }]}>
                  <Text style={{ fontSize:18 }}>{c.icon}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={s.catName}>{c.label}</Text>
                  {budget
                    ? <Text style={[s.spentTxt, over && { color:'#ff5555' }]}>{fmt(spent)} / {fmt(budget)} this month</Text>
                    : <Text style={s.nobudget}>No budget set</Text>}
                </View>
                <View style={{ flexDirection:'row', alignItems:'center', gap:4 }}>
                  <Text style={s.dollar}>$</Text>
                  <TextInput
                    style={s.budgetInput}
                    keyboardType="decimal-pad" placeholder="—" placeholderTextColor="#333"
                    value={draft[c.id] != null ? String(draft[c.id]) : ''}
                    onChangeText={(v) => setDraft({ ...draft, [c.id]: v })}
                  />
                </View>
              </View>
              {budget && (
                <View style={s.barTrack}>
                  <View style={[s.barFill, { width:`${pct}%`, backgroundColor: over?'#ff4444':warn?'#F39C12':c.color }]}/>
                </View>
              )}
              {over && <Text style={s.overMsg}>⚠ {fmt(spent - budget)} over budget</Text>}
              {warn && <Text style={s.warnMsg}>⚡ {Math.round(pct)}% of budget used</Text>}
            </View>
          );
        })}
        <TouchableOpacity style={[s.saveBtn, saved && { backgroundColor:'#27AE60' }]} onPress={saveBudgets}>
          <Text style={s.saveBtnTxt}>{saved ? '✓  BUDGETS SAVED' : 'SAVE BUDGETS'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex:1, backgroundColor:R.bg },
  content:     { padding:16, paddingBottom:60 },
  intro:       { color:'#444', fontSize:12, lineHeight:18, marginBottom:16 },
  card:        { backgroundColor:R.surface, borderWidth:1, borderColor:R.border, borderRadius:12, padding:14, marginBottom:12 },
  cardHead:    { flexDirection:'row', alignItems:'center', gap:10, marginBottom:8 },
  iconBox:     { width:36, height:36, borderRadius:10, justifyContent:'center', alignItems:'center' },
  catName:     { color:'#ccc', fontSize:14, fontWeight:'700' },
  spentTxt:    { color:'#555', fontSize:11, marginTop:2 },
  nobudget:    { color:'#333', fontSize:11, marginTop:2 },
  dollar:      { color:'#444', fontSize:13 },
  budgetInput: { backgroundColor:R.bg, borderWidth:1, borderColor:R.border, borderRadius:6, color:'#ddd', fontSize:14, padding:8, width:80, textAlign:'right' },
  barTrack:    { height:5, backgroundColor:'#1a1a20', borderRadius:3, overflow:'hidden', marginTop:4 },
  barFill:     { height:'100%', borderRadius:3 },
  overMsg:     { color:'#ff5555', fontSize:10, fontWeight:'700', marginTop:4 },
  warnMsg:     { color:'#F39C12', fontSize:10, fontWeight:'700', marginTop:4 },
  saveBtn:     { backgroundColor:R.accent, borderRadius:8, padding:16, alignItems:'center', marginTop:8 },
  saveBtnTxt:  { color:'#fff', fontWeight:'800', fontSize:14, letterSpacing:2 },
});
