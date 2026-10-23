
import { useState, useCallback } from "react";
import {
  View,
  Alert,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import {
  ambilSemuaFavorit,
  hapusFavorit,
} from "../../services/favoritStorage";
import {
  ambilRiwayatPencarian,
} from "../../services/riwayatStorage";
import {
  daftarKotaTersimpan,
  hapusCacheKota,
  hapusCacheKotaDariRiwayat,
} from "../../services/cacheRepository";

import { KotaFavorit } from "../../../types/favorit";
import { RingkasanKotaTersimpan } from "../../../types/cache";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { useColorScheme } from "../../hooks/use-color-scheme";

type KotaDenganKoordinat = {
  id: number;
  nama: string;
  latitude: number;
  longitude: number;
};

export default function TabRiwayat() {
  const [daftarRiwayat, setDaftarRiwayat] =
    useState<KotaFavorit[]>([]);
  const [daftarFavorit, setDaftarFavorit] =
    useState<KotaFavorit[]>([]);
  const [kotaTersimpan, setKotaTersimpan] =
    useState<RingkasanKotaTersimpan[]>([]);

  const router = useRouter();
  const modeTema = useColorScheme();

  // Warna judul menyesuaikan tema.
  const warnaJudulRiwayat =
    modeTema === "dark" ? "#38BDF8" : "#2F95DC";
  const warnaJudulCache =
    modeTema === "dark" ? "#4ADE80" : "#15803D";
  const warnaJudulFavorit =
    modeTema === "dark" ? "#FBBF24" : "#B45309";
  const warnaGaris =
    modeTema === "dark" ? "#374151" : "#D1D5DB";

  // Memuat ulang riwayat, favorit, dan cache.
  const muatData = useCallback(async () => {
    try {
      const [riwayat, favorit, cache] = await Promise.all([
        ambilRiwayatPencarian(),
        ambilSemuaFavorit(),
        daftarKotaTersimpan(),
      ]);

      setDaftarRiwayat(riwayat.slice(0, 10));
      setDaftarFavorit(favorit);
      setKotaTersimpan(cache);
    } catch (error) {
      console.error("Gagal memuat data:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void muatData();
    }, [muatData])
  );

  // Kembali ke Beranda dan munculkan pencarian kota.
  function bukaPencarianRiwayat(kota: KotaFavorit) {
    router.navigate({
      pathname: "/",
      params: {
        riwayatKota: kota.nama,
      },
    });
  }

  // Membuka detail kota dari cache atau favorit.
  function bukaDetailKota(kota: KotaDenganKoordinat) {
    router.push({
      pathname: "/detail/[kota]",
      params: {
        kota: kota.nama,
        id: String(kota.id),
        lat: String(kota.latitude),
        lon: String(kota.longitude),
      },
    });
  }

  // Menghapus cache dari daftar Cache Cuaca Tersimpan.
  async function hapusCache(kota: KotaDenganKoordinat) {
    try {
      await hapusCacheKota(
        kota.latitude,
        kota.longitude
      );

      await muatData();
    } catch (error) {
      console.error("Gagal menghapus cache:", error);

      const pesan = "Cache gagal dihapus. Silakan coba lagi.";

      if (Platform.OS === "web") {
        window.alert(pesan);
      } else {
        Alert.alert("Gagal", pesan);
      }
    }
  }

  // Konfirmasi penghapusan cache dari kota tersimpan.
  function konfirmasiHapusCache(
    kota: KotaDenganKoordinat
  ) {
    const pesan =
      `Hapus cache cuaca untuk ${kota.nama}? ` +
      "Data kota ini tidak lagi tersedia dari cache saat offline.";

    if (Platform.OS === "web") {
      if (window.confirm(pesan)) {
        void hapusCache(kota);
      }
      return;
    }

    Alert.alert("Konfirmasi Hapus Cache", pesan, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => {
          void hapusCache(kota);
        },
      },
    ]);
  }

  // Menghapus cache khusus dari daftar Riwayat Pencarian.
  async function hapusCacheDariRiwayat(kota: KotaFavorit) {
    try {
      const berhasil = await hapusCacheKotaDariRiwayat(
        kota.latitude,
        kota.longitude,
        kota.id,
        kota.nama
      );

      await muatData();

      const pesan = berhasil
        ? `Cache cuaca ${kota.nama} berhasil dihapus. Riwayat tetap tersimpan.`
        : `Cache cuaca ${kota.nama} tidak ditemukan. Riwayat tetap tersimpan.`;

      if (Platform.OS === "web") {
        window.alert(pesan);
      } else {
        Alert.alert(
          berhasil ? "Berhasil" : "Cache Tidak Ditemukan",
          pesan
        );
      }
    } catch (error) {
      console.error("Gagal menghapus cache riwayat:", error);

      const pesan = "Cache gagal dihapus. Silakan coba lagi.";

      if (Platform.OS === "web") {
        window.alert(pesan);
      } else {
        Alert.alert("Penghapusan Gagal", pesan);
      }
    }
  }

  // Konfirmasi penghapusan cache dari Riwayat Pencarian.
  function konfirmasiHapusCacheRiwayat(kota: KotaFavorit) {
    const pesan =
      `Hapus cache cuaca untuk ${kota.nama}? ` +
      "Nama kota tetap tersimpan di Riwayat Pencarian.";

    if (Platform.OS === "web") {
      if (window.confirm(pesan)) {
        void hapusCacheDariRiwayat(kota);
      }
      return;
    }

    Alert.alert("Konfirmasi Hapus Cache", pesan, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => {
          void hapusCacheDariRiwayat(kota);
        },
      },
    ]);
  }

  // Menghapus kota dari daftar favorit saja.
  async function hapusDariFavorit(id: number) {
    try {
      await hapusFavorit(id);
      await muatData();
    } catch (error) {
      console.error("Gagal menghapus favorit:", error);
    }
  }

  function konfirmasiHapusFavorit(kota: KotaFavorit) {
    const pesan = `Hapus ${kota.nama} dari daftar favorit?`;

    if (Platform.OS === "web") {
      if (window.confirm(pesan)) {
        void hapusDariFavorit(kota.id);
      }
      return;
    }

    Alert.alert("Konfirmasi Hapus Favorit", pesan, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => {
          void hapusDariFavorit(kota.id);
        },
      },
    ]);
  }

  // Tampilan tombol hapus.
  function TombolHapus({
    label,
    onPress,
  }: {
    label: string;
    onPress: () => void;
  }) {
    const lebarTombol =
      label === "Hapus Cache" ? 104 : 116;

    return (
      <TouchableOpacity
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={{
          backgroundColor: "#E74C3C",
          width:
            Platform.OS === "android"
              ? lebarTombol
              : undefined,
          paddingHorizontal:
            Platform.OS === "android" ? 6 : 12,
          paddingVertical: 9,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <ThemedText
          numberOfLines={
            Platform.OS === "android" ? 1 : undefined
          }
          adjustsFontSizeToFit={
            Platform.OS === "android"
          }
          minimumFontScale={0.75}
          allowFontScaling={Platform.OS !== "android"}
          style={{
            color: "#FFFFFF",
            fontSize: Platform.OS === "android" ? 11 : 12,
            lineHeight: 16,
            fontWeight: "600",
            textAlign: "center",
            includeFontPadding: false,
            ...(Platform.OS === "android"
              ? { fontFamily: "sans-serif" }
              : {}),
          }}
        >
          {label}
        </ThemedText>
      </TouchableOpacity>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "transparent",
        }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            gap: 24,
          }}
        >
          {/* Riwayat Pencarian */}
          <View style={{ gap: 10 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Ionicons
                name="time-outline"
                size={22}
                color={warnaJudulRiwayat}
              />
              <ThemedText
                style={{
                  fontSize: 17,
                  fontWeight: "bold",
                  color: warnaJudulRiwayat,
                }}
              >
                Riwayat Pencarian
              </ThemedText>
            </View>

            <ThemedText style={{ opacity: 0.7 }}>
              {daftarRiwayat.length} dari maksimal 10 kota
            </ThemedText>

            {daftarRiwayat.length === 0 && (
              <ThemedText style={{ opacity: 0.6 }}>
                Belum ada riwayat pencarian.
              </ThemedText>
            )}

            {daftarRiwayat.map((kota) => (
              <View
                key={`${kota.id}-${kota.latitude}-${kota.longitude}`}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: warnaGaris,
                }}
              >
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() =>
                    bukaPencarianRiwayat(kota)
                  }
                >
                  <ThemedText style={{ fontSize: 16 }}>
                    {kota.nama}
                  </ThemedText>
                </TouchableOpacity>

                <TombolHapus
                  label="Hapus Cache"
                  onPress={() =>
                    konfirmasiHapusCacheRiwayat(kota)
                  }
                />
              </View>
            ))}
          </View>

          {/* Cache Cuaca Tersimpan */}
          <View style={{ gap: 10 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Ionicons
                name="cloud-download-outline"
                size={22}
                color={warnaJudulCache}
              />
              <ThemedText
                style={{
                  fontSize: 17,
                  fontWeight: "bold",
                  color: warnaJudulCache,
                }}
              >
                Cache Cuaca Tersimpan
              </ThemedText>
            </View>

            {kotaTersimpan.length === 0 && (
              <ThemedText style={{ opacity: 0.6 }}>
                Belum ada cache cuaca tersimpan.
              </ThemedText>
            )}

            {kotaTersimpan.map((kota) => (
              <View
                key={kota.kunci}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: warnaGaris,
                }}
              >
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => bukaDetailKota(kota)}
                >
                  <ThemedText style={{ fontSize: 16 }}>
                    {kota.nama}
                  </ThemedText>
                </TouchableOpacity>

                <TombolHapus
                  label="Hapus Cache"
                  onPress={() =>
                    konfirmasiHapusCache(kota)
                  }
                />
              </View>
            ))}
          </View>

          {/* Kota Favorit */}
          <View style={{ gap: 10 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Ionicons
                name="star-outline"
                size={22}
                color={warnaJudulFavorit}
              />
              <ThemedText
                style={{
                  fontSize: 17,
                  fontWeight: "bold",
                  color: warnaJudulFavorit,
                }}
              >
                Kota Favorit
              </ThemedText>
            </View>

            {daftarFavorit.length === 0 && (
              <ThemedText style={{ opacity: 0.6 }}>
                Belum ada kota favorit.
              </ThemedText>
            )}

            {daftarFavorit.map((kota) => (
              <View
                key={`${kota.id}-${kota.latitude}-${kota.longitude}`}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: warnaGaris,
                }}
              >
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => bukaDetailKota(kota)}
                >
                  <ThemedText style={{ fontSize: 16 }}>
                    {kota.nama}
                  </ThemedText>
                </TouchableOpacity>

                <TombolHapus
                  label="Hapus Favorit"
                  onPress={() =>
                    konfirmasiHapusFavorit(kota)
                  }
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
