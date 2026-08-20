// app/receipts/_layout.js
import { Tabs, useRouter } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';
import { RColors } from '../../constants';

export default function ReceiptlyLayout() {
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{
        headerStyle:           { backgroundColor: RColors.surface, borderBottomColor: RColors.border, borderBottomWidth: 1 },
        headerTintColor:       RColors.text,
        headerTitleStyle:      { fontWeight: '800', letterSpacing: 3, fontSize: 15, color: RColors.text },
        headerLeft:            () => (
          <TouchableOpacity onPress={() => router.replace('/')} style={{ paddingHorizontal: 16 }}>
            <Text style={{ color: RColors.accent, fontSize: 22 }}>‹</Text>
          </TouchableOpacity>
        ),
        tabBarStyle:           { backgroundColor: RColors.surface, borderTopColor: RColors.border, borderTopWidth: 1, height: 62, paddingBottom: 10 },
        tabBarActiveTintColor:   RColors.accent,
        tabBarInactiveTintColor: RColors.textDim,
        tabBarLabelStyle:      { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
      }}
    >
      <Tabs.Screen name="index" options={{
        headerTitle:  'RECEIPTLY',
        tabBarLabel:  'Receipts',
        tabBarIcon:   ({ color }) => <Text style={{ fontSize: 20, color }}>🧾</Text>,
      }} />
      <Tabs.Screen name="stats" options={{
        headerTitle:  'STATS',
        tabBarLabel:  'Stats',
        tabBarIcon:   ({ color }) => <Text style={{ fontSize: 20, color }}>📊</Text>,
      }} />
      <Tabs.Screen name="budgets" options={{
        headerTitle:  'BUDGETS',
        tabBarLabel:  'Budgets',
        tabBarIcon:   ({ color }) => <Text style={{ fontSize: 20, color }}>🎯</Text>,
      }} />
    </Tabs>
  );
}
