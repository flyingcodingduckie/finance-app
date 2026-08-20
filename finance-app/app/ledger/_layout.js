// app/ledger/_layout.js
import { Tabs, useRouter } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';
import { LColors } from '../../constants';

const L = LColors;

export default function LedgerLayout() {
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{
        headerStyle:           { backgroundColor: L.bg, borderBottomColor: L.border, borderBottomWidth: 1 },
        headerTintColor:       L.text,
        headerTitleStyle:      { fontWeight: '800', letterSpacing: 2, fontSize: 15, color: L.text },
        headerLeft:            () => (
          <TouchableOpacity onPress={() => router.replace('/')} style={{ paddingHorizontal: 16 }}>
            <Text style={{ color: L.accent, fontSize: 22 }}>‹</Text>
          </TouchableOpacity>
        ),
        tabBarStyle:           { backgroundColor: L.bg, borderTopColor: L.border, borderTopWidth: 1, height: 62, paddingBottom: 10 },
        tabBarActiveTintColor:   L.accent,
        tabBarInactiveTintColor: L.tan,
        tabBarLabelStyle:      { fontSize: 10, fontWeight: '700', letterSpacing: .5 },
      }}
    >
      <Tabs.Screen name="index" options={{
        headerTitle: 'THE LEDGER',
        tabBarLabel: 'Expenses',
        tabBarIcon:  ({ color }) => <Text style={{ fontSize: 20, color }}>📒</Text>,
      }} />
      <Tabs.Screen name="debts" options={{
        headerTitle: 'DEBTS',
        tabBarLabel: 'Debts',
        tabBarIcon:  ({ color }) => <Text style={{ fontSize: 20, color }}>🤝</Text>,
      }} />
      <Tabs.Screen name="summary" options={{
        headerTitle: 'SUMMARY',
        tabBarLabel: 'Summary',
        tabBarIcon:  ({ color }) => <Text style={{ fontSize: 20, color }}>⚖️</Text>,
      }} />
    </Tabs>
  );
}
