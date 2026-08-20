// app/receipts/index.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Modal, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStorage } from '../../hooks/useStorage';
import { RColors, RECEIPT_CATS, getReceiptCat, fmt, fmtDate, todayISO, uid, getDateRange } from '../../constants';

const R = RColors;
const PRESETS = [
  { id:'all', label:'All Time' }, { id:'7d', label:'7 Days' },
  { id:'30d', label:'30 Days' }, { id:'mtd', label:'This Month' }, { id:'ytd', label:'This Year' },
];
const EMPTY = { merchant:'', amount:'', category:'food', date:todayISO(), note:'' };

export default function ReceiptsScreen() {
  const [receipts, persist, loading] = useStorage('receiptly-receipts-v1');
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm]     = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [preset, setPreset] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [expanded, setExpanded] = useState(null);

  const range    = getDateRange(preset);
  const inRange  = (r) => {
    if (!range.from && !range.to) return true;
    if (range.from && r.date < range.from) return false;
    if (range.to   && r.date > range.to)   return false;
    return true;
  };
  const filtered = receipts
    .filter((r) => catFilter === 'all' || r.category === catFilter)
    .filter(inRange)
    .sort((a, b) => sortBy === 'date' ? new Date(b.date) - new Date(a.date) : b.amount - a.amount);
  const total = filtered.reduce((s, r) => s + r.amount, 0);

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setModalVisible(true); };
  const openEdit = (r) => { setForm({ merchant:r.merchant, amount:String(r.amount), category:r.category, date:r.date, note:r.note||'' }); setEditId(r.id); setModalVisible(true); };

  const save = () => {
    if (!form.merchant.trim() || !form.amount || isNaN(+form.amount)) {
      Alert.alert('Missing fields', 'Please enter a merchant and valid amount.'); return;
    }
    const entry = { id: editId || uid(), merchant: form.merchant.trim(), amount: parseFloat(parseFloat(form.amount).toFixed(2)), category: form.category, date: form.date, note: form.note.trim() };
    persist(editId ? receipts.map((r) => r.id === editId ? entry : r) : [entry, ...receipts]);
    setModalVisible(false);
  };

  const remove = (id) => Alert.alert('Delete receipt?', '', [{ text:'Cancel', style:'cancel' }, { text:'Delete', style:'destructive', onPress:()=>persist(receipts.filter((r)=>r.id!==id)) }]);

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.strip} contentContainerStyle={s.stripRow}>
        {PRESETS.map((p) => (
          <TouchableOpacity key={p.id} style={[s.chip, preset===p.id && s.chipOn]} onPress={()=>setPreset(p.id)}>
            <Text style={[s.chipTxt, preset===p.id && s.chipTxtOn]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.strip} contentContainerStyle={s.stripRow}>
        {[{id:'all',icon:'✦',label:'All'}, ...RECEIPT_CATS].map((c) => (
          <TouchableOpacity key={c.id} style={[s.chip, catFilter===c.id && s.chipOn]} onPress={()=>setCatFilter(c.id)}>
            <Text style={[s.chipTxt, catFilter===c.id && s.chipTxtOn]}>{c.icon} {c.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={s.bar}>
        <View>
          <Text style={s.barLabel}>{filtered.length} RECEIPT{filtered.length!==1?'S':''}</Text>
          <Text style={s.barAmt}>{fmt(total)}</Text>
        </View>
        <View style={s.barRight}>
          <TouchableOpacity style={s.smBtn} onPress={()=>setSortBy(sortBy==='date'?'amount':'date')}>
            <Text style={s.smBtnTxt}>{sortBy==='date'?'By Date':'By Amt'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.smBtn} onPress={()=>Alert.alert('CSV Export',`Would export ${filtered.length} receipts via share sheet.`)}>
            <Text style={s.smBtnTxt}>⬇ CSV</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.list} contentContainerStyle={{ paddingBottom:100 }}>
        {loading ? <Text style={s.empty}>Loading…</Text>
        : filtered.length === 0 ? (
          <View style={s.emptyBox}><Text style={{ fontSize:48 }}>🧾</Text><Text style={s.emptyTxt}>No receipts found</Text><Text style={s.emptySub}>Tap + ADD below</Text></View>
        ) : filtered.map((r) => {
          const cat    = getReceiptCat(r.category);
          const isOpen = expanded === r.id;
          return (
            <View key={r.id}>
              <TouchableOpacity style={[s.row, { borderLeftColor:cat.color }]} onPress={()=>setExpanded(isOpen?null:r.id)} activeOpacity={.7}>
                <View style={[s.dot, { backgroundColor:cat.color+'22' }]}><Text style={{ fontSize:20 }}>{cat.icon}</Text></View>
                <View style={{ flex:1 }}>
                  <Text style={s.merchant} numberOfLines={1}>{r.merchant}</Text>
                  <Text style={s.meta}>{cat.label} · {fmtDate(r.date)}</Text>
                </View>
                <Text style={[s.amt, { color:cat.color }]}>{fmt(r.amount)}</Text>
              </TouchableOpacity>
              {isOpen && (
                <View style={s.detail}>
                  {r.note ? <Text style={s.noteText}>"{r.note}"</Text> : null}
                  <View style={{ flexDirection:'row', gap:8, marginTop:8 }}>
                    <TouchableOpacity style={s.editBtn} onPress={()=>openEdit(r)}><Text style={s.editBtnTxt}>✏ Edit</Text></TouchableOpacity>
                    <TouchableOpacity style={s.delBtn} onPress={()=>remove(r.id)}><Text style={s.delBtnTxt}>🗑 Delete</Text></TouchableOpacity>
                    <TouchableOpacity style={s.closeBtn} onPress={()=>setExpanded(null)}><Text style={s.closeBtnTxt}>✕</Text></TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={s.fab} onPress={openAdd}><Text style={s.fabTxt}>+ ADD</Text></TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modal}>
          <View style={s.mHead}>
            <Text style={s.mTitle}>{editId?'EDIT RECEIPT':'NEW RECEIPT'}</Text>
            <TouchableOpacity onPress={()=>setModalVisible(false)}><Text style={s.mClose}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding:20, paddingBottom:60 }}>
            <Text style={s.lbl}>MERCHANT *</Text>
            <TextInput style={s.inp} placeholder="e.g. Whole Foods, Uber…" placeholderTextColor="#444" value={form.merchant} onChangeText={(v)=>setForm({...form,merchant:v})} />
            <Text style={s.lbl}>AMOUNT *</Text>
            <TextInput style={s.inp} placeholder="0.00" placeholderTextColor="#444" keyboardType="decimal-pad" value={form.amount} onChangeText={(v)=>setForm({...form,amount:v})} />
            <Text style={s.lbl}>CATEGORY</Text>
            <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:4 }}>
              {RECEIPT_CATS.map((c) => (
                <TouchableOpacity key={c.id} style={[s.catBtn, form.category===c.id && { backgroundColor:c.color+'33', borderColor:c.color }]} onPress={()=>setForm({...form,category:c.id})}>
                  <Text style={{ fontSize:20, marginBottom:3 }}>{c.icon}</Text>
                  <Text style={[s.catBtnLbl, form.category===c.id && { color:c.color }]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.lbl}>DATE</Text>
            <TextInput style={s.inp} placeholder="YYYY-MM-DD" placeholderTextColor="#444" value={form.date} onChangeText={(v)=>setForm({...form,date:v})} />
            <Text style={s.lbl}>NOTE</Text>
            <TextInput style={[s.inp,{height:80}]} placeholder="Optional note…" placeholderTextColor="#444" multiline value={form.note} onChangeText={(v)=>setForm({...form,note:v})} />
            <TouchableOpacity style={s.saveBtn} onPress={save}><Text style={s.saveBtnTxt}>{editId?'SAVE CHANGES':'ADD RECEIPT'}</Text></TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex:1, backgroundColor:R.bg },
  strip:     { maxHeight:44, borderBottomWidth:1, borderBottomColor:R.border2 },
  stripRow:  { flexDirection:'row', paddingHorizontal:14, paddingVertical:8, gap:8 },
  chip:      { paddingHorizontal:12, paddingVertical:5, borderRadius:20, backgroundColor:'rgba(255,255,255,.06)', borderWidth:1, borderColor:'transparent' },
  chipOn:    { backgroundColor:'#E8633A22', borderColor:R.accent },
  chipTxt:   { color:'#555', fontSize:11, fontWeight:'700' },
  chipTxtOn: { color:R.accent },
  bar:       { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:14, borderBottomWidth:1, borderBottomColor:R.border2 },
  barLabel:  { color:R.textMuted, fontSize:10, letterSpacing:2, fontWeight:'700' },
  barAmt:    { color:'#fff', fontSize:24, fontWeight:'800', marginTop:2 },
  barRight:  { flexDirection:'row', gap:8 },
  smBtn:     { backgroundColor:'rgba(255,255,255,.07)', borderWidth:1, borderColor:R.border, borderRadius:6, paddingHorizontal:10, paddingVertical:6 },
  smBtnTxt:  { color:'#888', fontSize:11, fontWeight:'700' },
  list:      { flex:1 },
  empty:     { color:'#444', textAlign:'center', padding:40 },
  emptyBox:  { alignItems:'center', paddingVertical:80, gap:8 },
  emptyTxt:  { color:'#555', fontSize:16, fontWeight:'700' },
  emptySub:  { color:'#333', fontSize:12 },
  row:       { flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingVertical:14, borderBottomWidth:1, borderBottomColor:'#111116', borderLeftWidth:3 },
  dot:       { width:40, height:40, borderRadius:12, justifyContent:'center', alignItems:'center' },
  merchant:  { color:'#ddd', fontSize:15, fontWeight:'700' },
  meta:      { color:'#555', fontSize:11, marginTop:2 },
  amt:       { fontSize:15, fontWeight:'800' },
  detail:    { backgroundColor:'#0f0f13', paddingHorizontal:20, paddingVertical:12, borderBottomWidth:1, borderBottomColor:'#111116' },
  noteText:  { color:'#666', fontSize:12, fontStyle:'italic' },
  editBtn:   { backgroundColor:'rgba(255,255,255,.07)', borderRadius:6, paddingHorizontal:12, paddingVertical:7 },
  editBtnTxt:{ color:'#aaa', fontSize:11, fontWeight:'700' },
  delBtn:    { backgroundColor:'rgba(220,60,60,.1)', borderRadius:6, paddingHorizontal:12, paddingVertical:7 },
  delBtnTxt: { color:'#cc5555', fontSize:11, fontWeight:'700' },
  closeBtn:  { backgroundColor:'rgba(255,255,255,.05)', borderRadius:6, paddingHorizontal:12, paddingVertical:7 },
  closeBtnTxt:{ color:'#555', fontSize:11, fontWeight:'700' },
  fab:       { position:'absolute', bottom:24, right:20, backgroundColor:R.accent, borderRadius:8, paddingHorizontal:22, paddingVertical:14, elevation:6, shadowColor:'#E8633A', shadowOpacity:.4, shadowRadius:12, shadowOffset:{width:0,height:4} },
  fabTxt:    { color:'#fff', fontWeight:'800', fontSize:13, letterSpacing:2 },
  modal:     { flex:1, backgroundColor:R.surface },
  mHead:     { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:20, borderBottomWidth:1, borderBottomColor:R.border },
  mTitle:    { color:R.text, fontSize:18, fontWeight:'800', letterSpacing:3 },
  mClose:    { color:'#555', fontSize:20 },
  lbl:       { color:'#555', fontSize:10, letterSpacing:2, fontWeight:'700', marginBottom:6, marginTop:16 },
  inp:       { backgroundColor:R.bg, borderWidth:1, borderColor:R.border, borderRadius:8, color:'#ddd', fontSize:15, padding:12 },
  catBtn:    { width:'22%', alignItems:'center', padding:10, borderRadius:10, backgroundColor:'rgba(255,255,255,.05)', borderWidth:1.5, borderColor:'transparent' },
  catBtnLbl: { color:'#666', fontSize:10, fontWeight:'700', textAlign:'center' },
  saveBtn:   { backgroundColor:R.accent, borderRadius:8, padding:16, alignItems:'center', marginTop:24 },
  saveBtnTxt:{ color:'#fff', fontWeight:'800', fontSize:14, letterSpacing:2 },
});
