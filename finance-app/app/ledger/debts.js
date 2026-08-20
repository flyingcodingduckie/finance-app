// app/ledger/debts.js
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStorage } from '../../hooks/useStorage';
import { LColors, fmt, fmtDate, todayISO, uid } from '../../constants';

const L = LColors;
const EMPTY = { person:'', amount:'', dir:'owe', date:todayISO(), note:'', settled:false };
const FILTERS = [{ id:'all',label:'All' },{ id:'owe',label:'I Owe' },{ id:'owed',label:'Owed to Me' },{ id:'settled',label:'Settled' }];

export default function DebtsScreen() {
  const [debts, persist, loading] = useStorage('ledger-debts-v1');
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm]     = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const totalOwe  = debts.filter((d)=>!d.settled && d.dir==='owe').reduce((s,d)=>s+d.amount,0);
  const totalOwed = debts.filter((d)=>!d.settled && d.dir==='owed').reduce((s,d)=>s+d.amount,0);
  const net       = totalOwed - totalOwe;

  const filtered = debts.filter((d) => {
    if (filter==='all')     return true;
    if (filter==='settled') return d.settled;
    if (filter==='owe')     return !d.settled && d.dir==='owe';
    if (filter==='owed')    return !d.settled && d.dir==='owed';
    return true;
  }).sort((a,b)=>new Date(b.date)-new Date(a.date));

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setModalVisible(true); };
  const openEdit = (d) => { setForm({ person:d.person, amount:String(d.amount), dir:d.dir, date:d.date, note:d.note||'', settled:d.settled }); setEditId(d.id); setModalVisible(true); };

  const save = () => {
    if (!form.person.trim() || !form.amount || isNaN(+form.amount)) {
      Alert.alert('Missing info', 'Please enter a person and valid amount.'); return;
    }
    const entry = { id:editId||uid(), person:form.person.trim(), amount:parseFloat(parseFloat(form.amount).toFixed(2)), dir:form.dir, date:form.date, note:form.note.trim(), settled:form.settled };
    persist(editId ? debts.map((d)=>d.id===editId?entry:d) : [entry,...debts]);
    setModalVisible(false);
  };

  const remove       = (id) => Alert.alert('Delete?','',[ {text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>persist(debts.filter((d)=>d.id!==id))} ]);
  const toggleSettle = (id) => persist(debts.map((d)=>d.id===id?{...d,settled:!d.settled}:d));

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      {/* Summary */}
      <View style={s.summaryRow}>
        {[['YOU OWE', fmt(totalOwe), L.red],['OWED TO YOU', fmt(totalOwed), L.green],['NET', (net>=0?'+':'')+fmt(net), net>=0?L.green:L.red]].map(([lbl,val,col],i)=>(
          <React.Fragment key={lbl}>
            {i>0 && <View style={s.sumDivider}/>}
            <View style={s.summaryBox}>
              <Text style={s.sumLbl}>{lbl}</Text>
              <Text style={[s.sumAmt, {color:col}]}>{val}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.strip} contentContainerStyle={s.stripRow}>
        {FILTERS.map((f)=>(
          <TouchableOpacity key={f.id} style={[s.chip, filter===f.id && s.chipOn]} onPress={()=>setFilter(f.id)}>
            <Text style={[s.chipTxt, filter===f.id && s.chipTxtOn]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={s.list} contentContainerStyle={{ paddingBottom:100 }}>
        {loading ? <Text style={s.empty}>Loading…</Text>
        : filtered.length === 0 ? (
          <View style={s.emptyBox}><Text style={{ fontSize:44, opacity:.4 }}>🤝</Text><Text style={s.emptyTxt}>No debt notes</Text><Text style={s.emptySub}>Tap + NEW to record one</Text></View>
        ) : filtered.map((d) => {
          const isOpen      = expanded === d.id;
          const accentColor = d.settled ? L.tan : d.dir==='owe' ? L.red : L.green;
          return (
            <View key={d.id}>
              <TouchableOpacity style={[s.row, { borderLeftColor:accentColor, opacity:d.settled?.55:1 }]} onPress={()=>setExpanded(isOpen?null:d.id)} activeOpacity={.7}>
                <Text style={[s.arrow, { color:accentColor }]}>{d.dir==='owe'?'↑':'↓'}</Text>
                <View style={{ flex:1 }}>
                  <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginBottom:4 }}>
                    <Text style={s.person}>{d.person}</Text>
                    {d.settled && <View style={s.settledTag}><Text style={s.settledTagTxt}>Settled</Text></View>}
                  </View>
                  <View style={{ flexDirection:'row', gap:7, alignItems:'center' }}>
                    <View style={[s.tag, { backgroundColor:accentColor+'18', borderColor:accentColor+'44' }]}>
                      <Text style={[s.tagTxt, { color:accentColor }]}>{d.dir==='owe'?'I owe':'Owes me'}</Text>
                    </View>
                    <Text style={s.metaDate}>{fmtDate(d.date)}</Text>
                  </View>
                  {d.note ? <Text style={s.metaNote} numberOfLines={1}>· {d.note}</Text> : null}
                </View>
                <Text style={[s.amt, { color:accentColor }]}>{fmt(d.amount)}</Text>
              </TouchableOpacity>
              {isOpen && (
                <View style={s.detail}>
                  {d.note ? <Text style={s.noteText}>"{d.note}"</Text> : null}
                  <View style={{ flexDirection:'row', gap:8, marginTop:8, flexWrap:'wrap' }}>
                    <TouchableOpacity style={s.settleBtn} onPress={()=>toggleSettle(d.id)}><Text style={s.settleBtnTxt}>{d.settled?'↩ Unsettle':'✔ Settle'}</Text></TouchableOpacity>
                    <TouchableOpacity style={s.editBtn} onPress={()=>openEdit(d)}><Text style={s.editBtnTxt}>✏ Edit</Text></TouchableOpacity>
                    <TouchableOpacity style={s.delBtn} onPress={()=>remove(d.id)}><Text style={s.delBtnTxt}>🗑</Text></TouchableOpacity>
                    <TouchableOpacity style={s.closeBtn} onPress={()=>setExpanded(null)}><Text style={s.closeBtnTxt}>✕</Text></TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={s.fab} onPress={openAdd}><Text style={s.fabTxt}>+ NEW</Text></TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modal}>
          <View style={s.mHead}>
            <Text style={s.mTitle}>{editId?'EDIT DEBT NOTE':'NEW DEBT NOTE'}</Text>
            <TouchableOpacity onPress={()=>setModalVisible(false)}><Text style={s.mClose}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding:20, paddingBottom:60 }}>
            <Text style={s.lbl}>PERSON *</Text>
            <TextInput style={s.inp} placeholder="Who is involved?" placeholderTextColor={L.tan} value={form.person} onChangeText={(v)=>setForm({...form,person:v})} />
            <Text style={s.lbl}>AMOUNT *</Text>
            <TextInput style={s.inp} placeholder="0.00" placeholderTextColor={L.tan} keyboardType="decimal-pad" value={form.amount} onChangeText={(v)=>setForm({...form,amount:v})} />
            <Text style={s.lbl}>DIRECTION</Text>
            <View style={{ flexDirection:'row', gap:10, marginTop:4 }}>
              {[['owe','↑  I owe them'],['owed','↓  They owe me']].map(([v,l])=>(
                <TouchableOpacity key={v} style={[s.dirBtn, form.dir===v && { backgroundColor:(v==='owe'?L.red:L.green)+'18', borderColor:(v==='owe'?L.red:L.green) }]} onPress={()=>setForm({...form,dir:v})}>
                  <Text style={[s.dirBtnTxt, form.dir===v && { color:v==='owe'?L.red:L.green }]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.lbl}>DATE</Text>
            <TextInput style={s.inp} placeholder="YYYY-MM-DD" placeholderTextColor={L.tan} value={form.date} onChangeText={(v)=>setForm({...form,date:v})} />
            <Text style={s.lbl}>NOTE</Text>
            <TextInput style={[s.inp,{height:80}]} placeholder="What's this for?" placeholderTextColor={L.tan} multiline value={form.note} onChangeText={(v)=>setForm({...form,note:v})} />
            <TouchableOpacity style={s.saveBtn} onPress={save}><Text style={s.saveBtnTxt}>{editId?'Save Changes':'Add Debt Note'}</Text></TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex:1, backgroundColor:L.bg },
  summaryRow:  { flexDirection:'row', borderBottomWidth:1, borderBottomColor:L.border },
  summaryBox:  { flex:1, paddingVertical:14, alignItems:'center' },
  sumDivider:  { width:1, backgroundColor:L.border, marginVertical:10 },
  sumLbl:      { color:L.textMut, fontSize:9, letterSpacing:2, fontWeight:'700', marginBottom:4 },
  sumAmt:      { fontSize:17, fontWeight:'800' },
  strip:       { maxHeight:44, borderBottomWidth:1, borderBottomColor:L.border2 },
  stripRow:    { flexDirection:'row', paddingHorizontal:14, paddingVertical:8, gap:8 },
  chip:        { paddingHorizontal:12, paddingVertical:5, borderRadius:20, backgroundColor:'rgba(122,92,56,.1)' },
  chipOn:      { backgroundColor:L.accent },
  chipTxt:     { color:L.textDim, fontSize:11, fontWeight:'700' },
  chipTxtOn:   { color:'#fdf8f0' },
  list:        { flex:1 },
  empty:       { color:L.tan, textAlign:'center', padding:40 },
  emptyBox:    { alignItems:'center', paddingVertical:80, gap:8 },
  emptyTxt:    { color:L.tan, fontSize:16, fontWeight:'700' },
  emptySub:    { color:L.textMut, fontSize:12 },
  row:         { flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:18, paddingVertical:14, borderBottomWidth:1, borderBottomColor:L.border2, borderLeftWidth:3 },
  arrow:       { fontSize:22, width:24, fontWeight:'700', textAlign:'center' },
  person:      { color:L.text, fontSize:15, fontWeight:'700' },
  settledTag:  { backgroundColor:'rgba(184,156,114,.2)', borderRadius:10, paddingHorizontal:8, paddingVertical:2 },
  settledTagTxt:{ color:L.tan, fontSize:10, fontWeight:'700' },
  tag:         { paddingHorizontal:8, paddingVertical:2, borderRadius:12, borderWidth:1 },
  tagTxt:      { fontSize:10, fontWeight:'700' },
  metaDate:    { color:L.textMut, fontSize:10 },
  metaNote:    { color:L.tan, fontSize:11, fontStyle:'italic', marginTop:3 },
  amt:         { fontSize:16, fontWeight:'800' },
  detail:      { backgroundColor:'rgba(122,92,56,.04)', paddingHorizontal:18, paddingVertical:12, borderBottomWidth:1, borderBottomColor:L.border2 },
  noteText:    { color:L.textDim, fontSize:12, fontStyle:'italic' },
  settleBtn:   { backgroundColor:'rgba(39,131,90,.12)', borderRadius:6, paddingHorizontal:12, paddingVertical:7 },
  settleBtnTxt:{ color:L.green, fontSize:11, fontWeight:'700' },
  editBtn:     { backgroundColor:'rgba(92,61,30,.08)', borderRadius:6, paddingHorizontal:12, paddingVertical:7 },
  editBtnTxt:  { color:L.brown, fontSize:11, fontWeight:'700' },
  delBtn:      { backgroundColor:'rgba(192,57,43,.08)', borderRadius:6, paddingHorizontal:12, paddingVertical:7 },
  delBtnTxt:   { color:L.red, fontSize:11, fontWeight:'700' },
  closeBtn:    { backgroundColor:'rgba(122,92,56,.08)', borderRadius:6, paddingHorizontal:12, paddingVertical:7 },
  closeBtnTxt: { color:L.tan, fontSize:11, fontWeight:'700' },
  fab:         { position:'absolute', bottom:24, right:20, backgroundColor:L.accent, borderRadius:8, paddingHorizontal:22, paddingVertical:14, elevation:5, shadowColor:'#3d2c1a', shadowOpacity:.3, shadowRadius:10, shadowOffset:{width:0,height:3} },
  fabTxt:      { color:'#fdf8f0', fontWeight:'800', fontSize:13, letterSpacing:2 },
  modal:       { flex:1, backgroundColor:L.bg },
  mHead:       { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:20, borderBottomWidth:1, borderBottomColor:L.border },
  mTitle:      { color:L.text, fontSize:18, fontWeight:'800' },
  mClose:      { color:L.tan, fontSize:20 },
  lbl:         { color:L.tan, fontSize:10, letterSpacing:2, fontWeight:'700', marginBottom:6, marginTop:16 },
  inp:         { backgroundColor:L.surface, borderWidth:1, borderColor:L.border, borderRadius:8, color:L.text, fontSize:15, padding:12 },
  dirBtn:      { flex:1, padding:12, borderRadius:8, backgroundColor:'rgba(122,92,56,.06)', borderWidth:1.5, borderColor:L.border, alignItems:'center' },
  dirBtnTxt:   { color:L.textDim, fontSize:13, fontWeight:'700' },
  saveBtn:     { backgroundColor:L.accent, borderRadius:8, padding:16, alignItems:'center', marginTop:24 },
  saveBtnTxt:  { color:'#fdf8f0', fontWeight:'800', fontSize:14, letterSpacing:1.5 },
});
