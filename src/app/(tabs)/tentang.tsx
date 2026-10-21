import { SafeAreaView } from "react-native-safe-area-context";
import { typeScale, spacing } from "../../constants/styles";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";

export default function TabTentang() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView
        style={{
          flex: 1,
          padding: spacing.sedang,
          backgroundColor: "transparent",
        }}
      >
        <ThemedText
          style={{
            fontSize: typeScale.judul,
            fontWeight: "bold",
            marginBottom: spacing.sedang,
          }}
          accessibilityLabel="Judul Halaman Tentang Aplikasi"
        >
          Tentang Aplikasi
        </ThemedText>

        <ThemedView
          style={{
            padding: spacing.sedang,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "rgba(150, 150, 150, 0.2)",
          }}
        >
          <ThemedText style={{ fontSize: typeScale.subjudul, opacity: 0.6 }}>
            Nama Aplikasi
          </ThemedText>

          <ThemedText
            style={{
              fontSize: typeScale.isi,
              marginBottom: spacing.sedang,
            }}
          >
            Aplikasi Informasi Cuaca
          </ThemedText>

          <ThemedText style={{ fontSize: typeScale.subjudul, opacity: 0.6 }}>
            Versi
          </ThemedText>

          <ThemedText
            style={{
              fontSize: typeScale.isi,
              marginBottom: spacing.sedang,
            }}
          >
            1.0.0
          </ThemedText>

          <ThemedText style={{ fontSize: typeScale.subjudul, opacity: 0.6 }}>
            Pembuat
          </ThemedText>

          <ThemedText style={{ fontSize: typeScale.isi }}>
            Isnaeni Kholifatun
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}