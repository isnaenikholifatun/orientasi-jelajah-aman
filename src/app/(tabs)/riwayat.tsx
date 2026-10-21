// src/app/(tabs)/riwayat.tsx
import { useState, useCallback } from "react";
import { View, Button, Alert, Platform, TouchableOpacity, ScrollView } from "react-native"; 
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import { KotaFavorit } from "../../../types/favorit";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";

export default function TabRiwayat() {
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const router = useRouter();

  // Refresh daftar favorit tiap kali tab dibuka
  useFocusEffect(
    useCallback(() => {
      ambilSemuaFavorit().then((data) => {
        // TUGAS 2: Membatasi riwayat maksimal 10 kota terakhir
        setDaftarFavorit(data.slice(0, 10));
      });
    }, [])
  );

  async function hapus(id: number) {
    await hapusFavorit(id);
    setDaftarFavorit((prev) => prev.filter((k) => k.id !== id));
  }

  // Tugas 3: Konfirmasi hapus kota dari riwayat / favorit
  function konfirmasiHapus(id: number, nama: string) {
    if (Platform.OS === "web") {
      const setuju = window.confirm(`Yakin hapus ${nama}?`);
      if (setuju) {
        hapus(id);
      }
    } else {
      Alert.alert(
        "Konfirmasi Hapus",
        `Yakin hapus ${nama}?`,
        [
          {
            text: "Batal",
            style: "cancel",
          },
          {
            text: "Hapus",
            style: "destructive",
            onPress: () => hapus(id),
          },
        ]
      );
    }
  }

  // TUGAS 2: Saat kota diklik, otomatis memunculkan pencarian kota tersebut
  function bukaPencarianKota(kota: KotaFavorit) {
    router.push({
      pathname: "/detail/[kota]",
      params: {
        kota: kota.nama,
        id: String(kota.id || ""),
        lat: String(kota.latitude || ""),
        lon: String(kota.longitude || ""),
      },
    });
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          <ThemedText style={{ fontSize: 18, fontWeight: "bold" }}>
            Riwayat & Kota Favorit
          </ThemedText>
          
          {/* TUGAS 2: Tampilkan jumlah favorit (maks 10) */}
          <ThemedText style={{ opacity: 0.7 }}>
            Tersimpan {daftarFavorit.length} dari maks 10 kota
          </ThemedText>

          {daftarFavorit.length === 0 && (
            <ThemedText style={{ opacity: 0.5, marginTop: 12 }}>
              Belum ada kota favorit / riwayat
            </ThemedText>
          )}
          
          {daftarFavorit.map((kota) => (
            <View
              key={kota.id}
              style={{ 
                flexDirection: "row", 
                justifyContent: "space-between", 
                alignItems: "center",
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: "rgba(150, 150, 150, 0.2)",
              }}
            >
              {/* TUGAS 2: Nama kota bisa diklik untuk membuka pencarian ulang */}
              <TouchableOpacity 
                style={{ flex: 1 }}
                onPress={() => bukaPencarianKota(kota)}
              >
                <ThemedText style={{ fontSize: 16, color: "#007AFF" }}>
                  {kota.nama}
                </ThemedText>
              </TouchableOpacity>

              <Button 
                title="Hapus" 
                onPress={() => konfirmasiHapus(kota.id, kota.nama)} 
              />
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}