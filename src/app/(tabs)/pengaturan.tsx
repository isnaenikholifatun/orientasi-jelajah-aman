import { useState } from "react"; 
import { Text, Button, View, TouchableOpacity } from "react-native"; 
import { SafeAreaView } from "react-native-safe-area-context"; 
import { hapusSemuaCache } from "../../services/cacheRepository"; 
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { setAppThemeMode, useCurrentThemeMode } from "@/hooks/use-color-scheme";

export default function TabPengaturan() { 
  const [pesan, setPesan] = useState<string | null>(null); 
  const modePilihan = useCurrentThemeMode();

  async function hapusDataTersimpan() { 
    await hapusSemuaCache(); 
    setPesan("Data cuaca tersimpan sudah dihapus."); 
  } 

  return ( 
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, padding: 16, gap: 16, backgroundColor: 'transparent' }}> 
        <ThemedText style={{ fontSize: 20, fontWeight: "bold" }}>Pengaturan</ThemedText> 
        
        {/* Mode Tampilan */}
        <View style={{ gap: 8 }}>
          <ThemedText style={{ fontSize: 16, fontWeight: "600" }}>Mode Tampilan</ThemedText>
          
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity 
              onPress={() => setAppThemeMode("light")}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: modePilihan === "light" ? "#007AFF" : "#ccc",
                backgroundColor: modePilihan === "light" ? "#007AFF" : "transparent",
                alignItems: "center"
              }}
            >
              <Text style={{ color: modePilihan === "light" ? "#fff" : "#888", fontWeight: "bold" }}>Terang</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setAppThemeMode("dark")}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: modePilihan === "dark" ? "#007AFF" : "#ccc",
                backgroundColor: modePilihan === "dark" ? "#007AFF" : "transparent",
                alignItems: "center"
              }}
            >
              <Text style={{ color: modePilihan === "dark" ? "#fff" : "#888", fontWeight: "bold" }}>Gelap</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setAppThemeMode("system")}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: modePilihan === "system" ? "#007AFF" : "#ccc",
                backgroundColor: modePilihan === "system" ? "#007AFF" : "transparent",
                alignItems: "center"
              }}
            >
              <Text style={{ color: modePilihan === "system" ? "#fff" : "#888", fontWeight: "bold" }}>Sistem</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: "#ccc", marginVertical: 8 }} />

        {/* Aplikasi */}
        <ThemedText style={{ fontSize: 16, fontWeight: "600" }}>Aplikasi</ThemedText> 
        <ThemedText>Aplikasi Jelajah Aman - Versi 1.0.0</ThemedText> 
        
        <Button title="Hapus Data Cuaca Tersimpan" onPress={hapusDataTersimpan} color="#FF3B30" /> 
        {pesan && <ThemedText accessibilityLabel={pesan}>{pesan}</ThemedText>} 
      </SafeAreaView> 
    </ThemedView>
  ); 
}