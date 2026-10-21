import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // Tambahkan library ikon

export default function TabLayout() {
  return (
    // Mempertahankan perbaikan tabBarStyle milikmu agar menu tidak terpotong
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#2f95dc", // Warna biru saat menu diklik
        tabBarInactiveTintColor: "gray",  // Warna abu-abu saat tidak aktif
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 5,
        },
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: "Beranda",
          tabBarLabel: "Beranda",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="riwayat" 
        options={{ 
          title: "Riwayat & Favorit", // Label diperjelas sesuai instruksi UTS
          tabBarLabel: "Riwayat",
          tabBarIcon: ({ color, size }) => <Ionicons name="time" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="pengaturan" 
        options={{ 
          title: "Pengaturan",
          tabBarLabel: "Pengaturan",
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="tentang" 
        options={{ 
          title: "Tentang Aplikasi",
          tabBarLabel: "Tentang",
          tabBarIcon: ({ color, size }) => <Ionicons name="information-circle" size={size} color={color} />
        }} 
      />
    </Tabs>
  );
}