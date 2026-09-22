import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    //saya tambahkan karen menunya kelihatan separuh, ini mengatasi agar menunya bisa kelihatan semua.
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 5,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Beranda" }} />
      <Tabs.Screen name="riwayat" options={{ title: "Riwayat" }} />
      <Tabs.Screen name="pengaturan" options={{ title: "Pengaturan" }} />
      <Tabs.Screen name="tentang" options={{ title: "Tentang" }} />
    </Tabs>
  );
}