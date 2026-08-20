// app/ledger/index.js — Expenses
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStorage } from '../../hooks/useStorage';
import { LColors, EXPENSE_CATS, getExpCat, fmt, fmtDate, todayISO, uid, groupByMonth } from '../../constants';

const L = LColors;
const EMPTY = { desc:'', amount:'', cat:'food', date:todayISO(), note:'' };

export default function ExpensesScreen() {
  const [expenses, persist, loading] = useStorage('ledger-expenses-v1');
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm]     = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [catFilter, setCatFilter] = useState('all');
  const [expanded, setExpanded]   = useState(null);

  const filtered = expenses.filter((e) => catFilter === 'all' || e.cat === catFilter);
  const total    = filtered.reduce((s, e) => s + e.amount, 0);
  const groups   = groupByMonth(filtered);

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setModalVisible(true); };
  const openEdit = (e) => { setForm({ desc:e.desc, amount:String(e.amount), cat:e.cat, date:e.date, note:e.note||'' }); setEditId(e.id); setModalVisible(true); };

  const save = () => {
    if (!form.desc.trim() || !form.amount || isNaN(+form.amount)) {
      Alert.alert('Missing info', 'Please add a description and valid amount.'); return;
    }
    const entry = { id:editId||uid(), desc:form.desc.trim(), amount:parseFloat(parseFloat(form.amount).toFixed(2)), cat:form.cat, date:form.date, note:form.note.trim() };
    persist(editId ? expenses.map((e)=>e.id===editId?entry:e) : [entry,...expenses]);
    setModalVisible(false);
  };

  const remove = (id) => Alert.alert('Delete expense?','',[ {text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>persist(expenses.filter((e)=>e.id!==id))} ]);

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.strip} contentContainerStyle={s.stripRow}>
        {[{id:'all',icon:'✦',label:'All'}, ...EXPENSE_CATS].map((c) => (
          <TouchableOpacity key={c.id} style={[s.chip, catFilter===c.id && s.chipOn]} onPress={()=>setCatFilter(c.id)}>
            <Text style={[s.chipTxt, catFilter===c.id && s.chipTxtOn]}>{c.icon} {c.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={s.bar}>
        <Text style={s.barLabel}>TOTAL  ·  {filtered.length} ITEMS</Text>
        <Text style={s.barAmt}>{fmt(total)}</Text>
      </View>

      <ScrollView style={s.list} contentContainerStyle={{ paddingBottom:100 }}>
        {loading ? <Text style={s.empty}>Loading…</Text>
        : groups.length === 0 ? (
          <View style={s.emptyBox}><Text style={{ fontSize:44, opacity:.4 }}>📒</Text><Text style={s.emptyTxt}>No expenses yet</Text><Text style={s.emptySub}>Tap + NEW to add one</Text></View>
        ) : groups.map(({ label, items }) => (
          <View key={label}>
            <View style={s.divider}>
              <View style={s.divLine}/><Text style={s.divLabel}>{label.toUpperCase()}</Text><View style={s.divLine}/>
            </View>
            {items.map((e) => {
              const cat    = getExpCat(e.cat);
              const isOpen = expanded === e.id;
              return (
                <View key={e.id}>
                  <TouchableOpacity style={[s.row, { borderLeftColor:cat.color }]} onPress={()=>setExpanded(isOpen?null:e.id)} activeOpacity={.7}>
                    <Text style={s.rowIcon}>{cat.icon}</Text>
                    <View style={{ flex:1 }}>
                      <Text style={s.desc} numberOfLines={1}>{e.desc}</Text>
                      <View style={s.rowMeta}>
                        <View style={[s.tag, { backgroundColor:cat.color+'18', borderColor:cat.color+'33' }]}>
                          <Text style={[s.tagTxt, { color:cat.color }]}>{cat.label}</Text>
                        </View>
                        <Text style={s.metaDate}>{fmtDate(e.date)}</Text>
                      </View>
                    </View>
                    <Text style={s.amt}>{fmt(e.amount)}</Text>
                  </TouchableOpacity>
                  {isOpen && (
                    <View style={s.detail}>
                      {e.note ? <Text style={s.noteText}>"{e.note}"</Text> : null}
                      <View style={{ flexDirection:'row', gap:8, marginTop:8 }}>
                        <TouchableOpacity style={s.editBtn} onPress={()=>openEdit(e)}><Text style={s.editBtnTxt}>✏ Edit</Text></TouchableOpacity>
                        <TouchableOpacity style={s.delBtn} onPress={()=>remove(e.id)}><Text style={s.delBtnTxt}>🗑 Delete</Text></TouchableOpacity>
                        <TouchableOpacity style={s.closeBtn} onPress={()=>setExpanded(null)}><Text style={s.closeBtnTxt}>✕</Text></TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={s.fab} onPress={openAdd}><Text style={s.fabTxt}>+ NEW</Text></TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modal}>
          <View style={s.mHead}>
            <Text style={s.mTitle}>{editId?'Edit Expense':'New Expense'}</Text>
            <TouchableOpacity onPress={()=>setModalVisible(false)}><Text style={s.mClose}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding:20, paddingBottom:60 }}>
            <Text style={s.lbl}>DESCRIPTION *</Text>
            <TextInput style={s.inp} placeholder="What did you spend on?" placeholderTextColor={L.tan} value={form.desc} onChangeText={(v)=>setForm({...form,desc:v})} />
            <Text style={s.lbl}>AMOUNT *</Text>
            <TextInput style={s.inp} placeholder="0.00" placeholderTextColor={L.tan} keyboardType="decimal-pad" value={form.amount} onChangeText={(v)=>setForm({...form,amount:v})} />
            <Text style={s.lbl}>CATEGORY</Text>
            <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:4 }}>
              {EXPENSE_CATS.map((c) => (
                <TouchableOpacity key={c.id} style={[s.catBtn, form.cat===c.id && { backgroundColor:c.color+'22', borderColor:c.color }]} onPress={()=>setForm({...form,cat:c.id})}>
                  <Text style={{ fontSize:20, marginBottom:3 }}>{c.icon}</Text>
                  <Text style={[s.catBtnLbl, form.cat===c.id && { color:c.color }]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.lbl}>DATE</Text>
            <TextInput style={s.inp} placeholder="YYYY-MM-DD" placeholderTextColor={L.tan} value={form.date} onChangeText={(v)=>setForm({...form,date:v})} />
            <Text style={s.lbl}>NOTE</Text>
            <TextInput style={[s.inp,{height:80}]} placeholder="Optional note…" placeholderTextColor={L.tan} multiline value={form.note} onChangeText={(v)=>setForm({...form,note:v})} />
            <TouchableOpacity style={s.saveBtn} onPress={save}><Text style={s.saveBtnTxt}>{editId?'Save Changes':'Add Expense'}</Text></TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex:1, backgroundColor:L.bg },
  strip:      { maxHeight:44, borderBottomWidth:1, borderBottomColor:L.border2 },
  stripRow:   { flexDirection:'row', paddingHorizontal:14, paddingVertical:8, gap:8 },
  chip:       { paddingHorizontal:12, paddingVertical:5, borderRadius:20, backgroundColor:'rgba(122,92,56,.1)' },
  chipOn:     { backgroundColor:L.accent },
  chipTxt:    { color:L.textDim, fontSize:11, fontWeight:'700' },
  chipTxtOn:  { color:'#fdf8f0' },
  bar:        { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:18, paddingVertical:12, borderBottomWidth:1, borderBottomColor:L.border2, backgroundColor:'rgba(122,92,56,.04)' },
  barLabel:   { color:L.textMut, fontSize:10, letterSpacing:2, fontWeight:'700' },
  barAmt:     { color:L.accent, fontSize:22, fontWeight:'800' },
  list:       { flex:1 },
  empty:      { color:L.tan, textAlign:'center', padding:40 },
  emptyBox:   { alignItems:'center', paddingVertical:80, gap:8 },
  emptyTxt:   { color:L.tan, fontSize:16, fontWeight:'700' },
  emptySub:   { color:L.textMut, fontSize:12 },
  divider:    { flexDirection:'row', alignItems:'center', paddingHorizontal:18, paddingVertical:10, gap:10 },
  divLine:    { flex:1, height:1, backgroundColor:L.border },
  divLabel:   { color:L.tan, fontSize:10, fontWeight:'700', letterSpacing:2 },
  row:        { flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:18, paddingVertical:14, borderBottomWidth:1, borderBottomColor:L.border2, borderLeftWidth:3 },
  rowIcon:    { fontSize:22, width:30, textAlign:'center' },
  desc:       { color:L.text, fontSize:15, fontWeight:'700', marginBottom:4 },
  rowMeta:    { flexDirection:'row', alignItems:'center', gap:7 },
  tag:        { paddingHorizontal:8, paddingVertical:2, borderRadius:12, borderWidth:1 },
  tagTxt:     { fontSize:10, fontWeight:'700' },
  metaDate:   { color:L.textMut, fontSize:10 },
  amt:        { color:L.accent, fontSize:15, fontWeight:'800' },
  detail:     { backgroundColor:'rgba(122,92,56,.04)', paddingHorizontal:18, paddingVertical:12, borderBottomWidth:1, borderBottomColor:L.border2 },
  noteText:   { color:L.textDim, fontSize:12, fontStyle:'italic' },
  editBtn:    { backgroundColor:'rgba(92,61,30,.08)', borderRadius:6, paddingHorizontal:12, paddingVertical:7 },
  editBtnTxt: { color:L.brown, fontSize:11, fontWeight:'700' },
  delBtn:     { backgroundColor:'rgba(192,57,43,.08)', borderRadius:6, paddingHorizontal:12, paddingVertical:7 },
  delBtnTxt:  { color:L.red, fontSize:11, fontWeight:'700' },
  closeBtn:   { backgroundColor:'rgba(122,92,56,.08)', borderRadius:6, paddingHorizontal:12, paddingVertical:7 },
  closeBtnTxt:{ color:L.tan, fontSize:11, fontWeight:'700' },
  fab:        { position:'absolute', bottom:24, right:20, backgroundColor:L.accent, borderRadius:8, paddingHorizontal:22, paddingVertical:14, elevation:5, shadowColor:'#3d2c1a', shadowOpacity:.3, shadowRadius:10, shadowOffset:{width:0,height:3} },
  fabTxt:     { color:'#fdf8f0', fontWeight:'800', fontSize:13, letterSpacing:2 },
  modal:      { flex:1, backgroundColor:L.bg },
  mHead:      { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:20, borderBottomWidth:1, borderBottomColor:L.border },
  mTitle:     { color:L.text, fontSize:18, fontWeight:'800' },
  mClose:     { color:L.tan, fontSize:20 },
  lbl:        { color:L.tan, fontSize:10, letterSpacing:2, fontWeight:'700', marginBottom:6, marginTop:16 },
  inp:        { backgroundColor:L.surface, borderWidth:1, borderColor:L.border, borderRadius:8, color:L.text, fontSize:15, padding:12 },
  catBtn:     { width:'22%', alignItems:'center', padding:10, borderRadius:10, backgroundColor:'rgba(122,92,56,.07)', borderWidth:1.5, borderColor:'transparent' },
  catBtnLbl:  { color:L.textDim, fontSize:10, fontWeight:'700', textAlign:'center' },
  saveBtn:    { backgroundColor:L.accent, borderRadius:8, padding:16, alignItems:'center', marginTop:24 },
  saveBtnTxt: { color:'#fdf8f0', fontWeight:'800', fontSize:14, letterSpacing:1.5 },
});
