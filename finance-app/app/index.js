// app/index.js — Home / App Selector
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar as RNStatusBar, Platform, ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safe}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.wordmark}>FINANCE</Text>
          <Text style={s.tagline}>your personal money suite</Text>
        </View>

        {/* App cards */}
        <View style={s.cards}>

          {/* Receiptly card */}
          <TouchableOpacity
            style={[s.card, s.cardDark]}
            onPress={() => router.push('/receipts')}
            activeOpacity={0.88}
          >
            <View style={s.cardInner}>
              <View style={[s.appIconWrap, { backgroundColor: '#E8633A22' }]}>
                <Text style={s.appIcon}>🧾</Text>
              </View>
              <View style={s.cardText}>
                <Text style={[s.appName, { color: '#E0DDD8' }]}>Receiptly</Text>
                <Text style={[s.appDesc, { color: '#666' }]}>
                  Track receipts, monitor budgets, and analyze spending by category
                </Text>
              </View>
              <View style={s.cardMeta}>
                <View style={s.featureRow}>
                  {['Receipts','Stats','Budgets'].map((f) => (
                    <View key={f} style={[s.featureTag, { backgroundColor: '#E8633A18', borderColor: '#E8633A33' }]}>
                      <Text style={[s.featureTagTxt, { color: '#E8633A' }]}>{f}</Text>
                    </View>
                  ))}
                </View>
                <Text style={[s.cardArrow, { color: '#E8633A' }]}>Open →</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Ledger card */}
          <TouchableOpacity
            style={[s.card, s.cardLight]}
            onPress={() => router.push('/ledger')}
            activeOpacity={0.88}
          >
            <View style={s.cardInner}>
              <View style={[s.appIconWrap, { backgroundColor: '#5c3d1e18' }]}>
                <Text style={s.appIcon}>⬡</Text>
              </View>
              <View style={s.cardText}>
                <Text style={[s.appName, { color: '#3d2c1a' }]}>The Ledger</Text>
                <Text style={[s.appDesc, { color: '#9a7d58' }]}>
                  Log expenses, track who owes what, and see your net balance at a glance
                </Text>
              </View>
              <View style={s.cardMeta}>
                <View style={s.featureRow}>
                  {['Expenses','Debts','Summary'].map((f) => (
                    <View key={f} style={[s.featureTag, { backgroundColor: '#5c3d1e12', borderColor: '#5c3d1e28' }]}>
                      <Text style={[s.featureTagTxt, { color: '#7a5c38' }]}>{f}</Text>
                    </View>
                  ))}
                </View>
                <Text style={[s.cardArrow, { color: '#5c3d1e' }]}>Open →</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={s.footer}>All data stored locally on your device</Text>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#0D0D0F' },
  safe:         { flex: 1, justifyContent: 'space-between' },
  header:       { paddingHorizontal: 28, paddingTop: 36, paddingBottom: 8 },
  wordmark:     { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: 6 },
  tagline:      { color: '#444', fontSize: 13, letterSpacing: 2, marginTop: 6 },
  cards:        { flex: 1, paddingHorizontal: 20, paddingVertical: 20, gap: 16, justifyContent: 'center' },
  card:         { borderRadius: 20, overflow: 'hidden', elevation: 6 },
  cardDark:     { backgroundColor: '#111114', borderWidth: 1, borderColor: '#1e1e24', shadowColor: '#E8633A', shadowOpacity: .1, shadowRadius: 20, shadowOffset: { width: 0, height: 4 } },
  cardLight:    { backgroundColor: '#faf6ef', borderWidth: 1, borderColor: 'rgba(80,55,30,.15)', shadowColor: '#5c3d1e', shadowOpacity: .1, shadowRadius: 20, shadowOffset: { width: 0, height: 4 } },
  cardInner:    { padding: 24, gap: 14 },
  appIconWrap:  { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  appIcon:      { fontSize: 26 },
  cardText:     { gap: 6 },
  appName:      { fontSize: 22, fontWeight: '800', letterSpacing: .5 },
  appDesc:      { fontSize: 13, lineHeight: 19 },
  cardMeta:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featureRow:   { flexDirection: 'row', gap: 6 },
  featureTag:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  featureTagTxt:{ fontSize: 10, fontWeight: '700' },
  cardArrow:    { fontSize: 14, fontWeight: '800' },
  footer:       { textAlign: 'center', color: '#2a2a30', fontSize: 11, paddingBottom: 20, letterSpacing: 1 },
});
