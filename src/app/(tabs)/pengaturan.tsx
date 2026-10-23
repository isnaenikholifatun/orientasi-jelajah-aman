
import { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Platform,
  Alert,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { hapusSemuaCache } from "../../services/cacheRepository";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { useTheme } from "../../hooks/use-theme";
import {
  setAppThemeMode,
  useCurrentThemeMode,
} from "@/hooks/use-color-scheme";

export default function TabPengaturan() {
  const [pesan, setPesan] = useState<string | null>(null);
  const modePilihan = useCurrentThemeMode();
  const theme = useTheme() as Record<string, string>;
  const { width } = useWindowDimensions();

  const warnaTeks = theme?.text || "#222222";
  const warnaGaris = theme?.icon || "#D1D5DB";
  const warnaAksen = "#2f95dc";

  const lebarTombol = width < 420 ? 90 : 125;

  async function hapusDataTersimpan() {
    try {
      await hapusSemuaCache();
      setPesan("Data cuaca tersimpan berhasil dihapus.");
    } catch (error) {
      console.error("Gagal menghapus cache:", error);
      setPesan("Data cuaca gagal dihapus. Silakan coba lagi.");
    }
  }

  function konfirmasiHapus() {
    const isiPesan =
      "Yakin ingin menghapus semua data cuaca tersimpan?";

    if (Platform.OS === "web") {
      if (window.confirm(isiPesan)) {
        void hapusDataTersimpan();
      }
      return;
    }

    Alert.alert("Konfirmasi Hapus", isiPesan, [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => {
          void hapusDataTersimpan();
        },
      },
    ]);
  }

  function renderTombolMode(
    label: string,
    value: "light" | "dark" | "system"
  ) {
    const aktif = modePilihan === value;

    return (
      <TouchableOpacity
        key={value}
        onPress={() => setAppThemeMode(value)}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: aktif }}
        style={{
          width: lebarTombol,
          paddingVertical: 12,
          paddingHorizontal: 8,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: aktif ? warnaAksen : warnaGaris,
          backgroundColor: aktif ? warnaAksen : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: aktif ? "#FFFFFF" : warnaTeks,
            fontWeight: "600",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          {label}
        </Text>
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
            paddingBottom: 32,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 1500,
              alignSelf: "center",
              gap: 16,
            }}
          >
            {/* Mode Tampilan */}
            <ThemedView
              style={{
                borderWidth: 1,
                borderColor: warnaGaris,
                borderRadius: 14,
                padding: 16,
                gap: 12,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                Mode Tampilan
              </ThemedText>

              <ThemedText style={{ opacity: 0.7 }}>
                Pilih mode tampilan aplikasi sesuai preferensi.
              </ThemedText>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  alignSelf: "flex-start",
                }}
              >
                {renderTombolMode("Terang", "light")}
                {renderTombolMode("Gelap", "dark")}
                {renderTombolMode("Ikuti Sistem", "system")}
              </View>

              <ThemedText
                style={{
                  fontSize: 12,
                  opacity: 0.65,
                }}
              >
                {modePilihan === "system"
                  ? "Tampilan mengikuti pengaturan tema perangkat."
                  : modePilihan === "dark"
                    ? "Mode gelap sedang dipilih."
                    : "Mode terang sedang dipilih."}
              </ThemedText>
            </ThemedView>

            {/* Penyimpanan Data */}
            <ThemedView
              style={{
                borderWidth: 1,
                borderColor: warnaGaris,
                borderRadius: 14,
                padding: 16,
                gap: 12,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                Penyimpanan Data
              </ThemedText>

              <ThemedText
                style={{
                  opacity: 0.7,
                  lineHeight: 20,
                }}
              >
                Hapus semua data cuaca yang tersimpan di perangkat.
                Data akan diambil ulang dari internet saat diperlukan.
              </ThemedText>

              <TouchableOpacity
                onPress={konfirmasiHapus}
                accessibilityRole="button"
                accessibilityLabel="Hapus Data Cuaca"
                style={{
                  backgroundColor: "#e74c3c",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  alignItems: "center",
                  alignSelf: "flex-start",
                  minWidth: 150,
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontWeight: "700",
                    fontSize: 13,
                  }}
                >
                  Hapus Data Cuaca
                </Text>
              </TouchableOpacity>

              {pesan && (
                <ThemedText accessibilityLabel={pesan}>
                  {pesan}
                </ThemedText>
              )}
            </ThemedView>

            {/* Informasi aplikasi */}
            <ThemedText
              style={{
                textAlign: "center",
                opacity: 0.6,
                marginTop: 4,
                fontSize: 12,
              }}
            >
              Aplikasi Jelajah Aman - Versi 1.0.0
            </ThemedText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
