// app/receipts/stats.js
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStorage } from '../../hooks/useStorage';
import { RColors, RECEIPT_CATS, fmt, getDateRange } from '../../constants';

const R = RColors;
const PRESETS = [
  { id:'all', label:'All Time' }, { id:'7d', label:'7 Days' },
  { id:'30d', label:'30 Days' }, { id:'mtd', label:'This Month' }, { id:'ytd', label:'This Year' },
];

export default function StatsScreen() {
  const [receipts,,loading] = useStorage('receiptly-receipts-v1');
  const [preset, setPreset] = useState('mtd');

  const range    = getDateRange(preset);
  const filtered = receipts.filter((r) => {
    if (!range.from && !range.to) return true;
    if (range.from && r.date < range.from) return false;
    if (range.to   && r.date > range.to)   return false;
    return true;
  });

  const total = filtered.reduce((s, r) => s + r.amount, 0);
  const avg   = filtered.length ? total / filtered.length : 0;

  const byCat = RECEIPT_CATS.map((c) => {
    const items = filtered.filter((r) => r.category === c.id);
    return { ...c, total: items.reduce((s,r)=>s+r.amount,0), count: items.length };
  }).filter((c) => c.count > 0).sort((a,b) => b.total - a.total);
  const maxTotal = byCat[0]?.total || 1;

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.strip} contentContainerStyle={s.stripRow}>
        {PRESETS.map((p) => (
          <TouchableOpacity key={p.id} style={[s.chip, preset===p.id && s.chipOn]} onPress={()=>setPreset(p.id)}>
            <Text style={[s.chipTxt, preset===p.id && s.chipTxtOn]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.cards}>
          {[['TOTAL',fmt(total)],['RECEIPTS',String(filtered.length)],['AVG',fmt(avg)]].map(([l,v])=>(
            <View key={l} style={s.card}>
              <Text style={s.cardLbl}>{l}</Text>
              <Text style={s.cardVal}>{v}</Text>
            </View>
          ))}
        </View>
        {byCat.length > 0 ? (
          <>
            <Text style={s.secTitle}>BY CATEGORY</Text>
            {byCat.map((c) => (
              <View key={c.id} style={s.catRow}>
                <Text style={s.catIcon}>{c.icon}</Text>
                <View style={{ flex:1 }}>
                  <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:5 }}>
                    <Text style={s.catName}>{c.label.toUpperCase()}</Text>
                    <Text style={[s.catAmt, { color:c.color }]}>{fmt(c.total)}</Text>
                  </View>
                  <View style={s.barTrack}>
                    <View style={[s.barFill, { width:`${(c.total/maxTotal)*100}%`, backgroundColor:c.color }]}/>
                  </View>
                  <Text style={s.catMeta}>{c.count} receipt{c.count!==1?'s':''} · avg {fmt(c.total/c.count)}</Text>
                </View>
              </View>
            ))}
          </>
        ) : (
          <View style={s.emptyBox}>
            <Text style={{ fontSize:48, marginBottom:12 }}>📊</Text>
            <Text style={s.emptyTxt}>No data for this period</Text>
          </View>
        )}
        {filtered.length > 0 && (
          <TouchableOpacity style={s.exportBtn} onPress={()=>Alert.alert('CSV Export',`Would export ${filtered.length} receipts.`)}>
            <Text style={s.exportTxt}>⬇  EXPORT {filtered.length} RECEIPTS AS CSV</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex:1, backgroundColor:R.bg },
  strip:      { maxHeight:44, borderBottomWidth:1, borderBottomColor:R.border2 },
  stripRow:   { flexDirection:'row', paddingHorizontal:14, paddingVertical:8, gap:8 },
  chip:       { paddingHorizontal:12, paddingVertical:5, borderRadius:20, backgroundColor:'rgba(255,255,255,.06)', borderWidth:1, borderColor:'transparent' },
  chipOn:     { backgroundColor:'#E8633A22', borderColor:R.accent },
  chipTxt:    { color:'#555', fontSize:11, fontWeight:'700' },
  chipTxtOn:  { color:R.accent },
  content:    { padding:16, paddingBottom:60 },
  cards:      { flexDirection:'row', gap:10, marginBottom:24 },
  card:       { flex:1, backgroundColor:R.surface, borderWidth:1, borderColor:R.border, borderRadius:12, padding:14 },
  cardLbl:    { color:R.textMuted, fontSize:9, letterSpacing:2, fontWeight:'700', marginBottom:6 },
  cardVal:    { color:'#fff', fontSize:18, fontWeight:'800' },
  secTitle:   { color:R.textMuted, fontSize:10, letterSpacing:3, fontWeight:'700', marginBottom:12 },
  catRow:     { flexDirection:'row', gap:12, marginBottom:16 },
  catIcon:    { fontSize:24, width:30 },
  catName:    { color:'#aaa', fontSize:12, fontWeight:'700', letterSpacing:1 },
  catAmt:     { fontSize:14, fontWeight:'700' },
  barTrack:   { height:4, backgroundColor:'#1a1a20', borderRadius:2, overflow:'hidden', marginBottom:4 },
  barFill:    { height:'100%', borderRadius:2 },
  catMeta:    { color:'#555', fontSize:11 },
  emptyBox:   { alignItems:'center', paddingVertical:60 },
  emptyTxt:   { color:'#555', fontSize:16, fontWeight:'700' },
  exportBtn:  { backgroundColor:R.surface, borderWidth:1, borderColor:R.border, borderRadius:8, padding:16, alignItems:'center', marginTop:24 },
  exportTxt:  { color:'#888', fontSize:12, fontWeight:'700', letterSpacing:1 },
});
