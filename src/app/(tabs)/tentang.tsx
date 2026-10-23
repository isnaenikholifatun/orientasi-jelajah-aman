
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { spacing } from "../../constants/styles";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { useColorScheme } from "../../hooks/use-color-scheme";

export default function TabTentang() {
  const modeTema = useColorScheme();
  const isDark = modeTema === "dark";

  const warnaKartu = isDark ? "#172B4D" : "#FFFFFF";
  const warnaGaris = isDark ? "#334B6B" : "#E2E8F0";
  const warnaTeks = isDark ? "#F8FAFC" : "#1F2937";
  const warnaSekunder = isDark ? "#CBD5E1" : "#64748B";
  const warnaAksen = isDark ? "#38BDF8" : "#2F95DC";

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView
        style={{
          flex: 1,
          padding: spacing.sedang,
          backgroundColor: "transparent",
        }}
      >
        {/* Identitas aplikasi */}
        <View
          style={{
            alignItems: "center",
            paddingVertical: 24,
            gap: 10,
          }}
        >
          <View
            style={{
              width: 76,
              height: 76,
              borderRadius: 22,
              backgroundColor: isDark ? "#1E3A5F" : "#EAF5FF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="partly-sunny-outline"
              size={42}
              color={warnaAksen}
            />
          </View>

          <ThemedText
            style={{
              fontSize: 26,
              fontWeight: "bold",
              color: warnaTeks,
              textAlign: "center",
            }}
          >
            Jelajah Aman
          </ThemedText>

          <ThemedText
            style={{
              fontSize: 14,
              color: warnaSekunder,
              textAlign: "center",
            }}
          >
            Informasi cuaca dan kualitas udara
          </ThemedText>

          <View
            style={{
              backgroundColor: isDark ? "#1E3A5F" : "#EAF5FF",
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 20,
              marginTop: 2,
            }}
          >
            <ThemedText
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: warnaAksen,
              }}
            >
              Versi 1.0.0
            </ThemedText>
          </View>
        </View>

        {/* Informasi aplikasi */}
        <View
          style={{
            backgroundColor: warnaKartu,
            borderWidth: 1,
            borderColor: warnaGaris,
            borderRadius: 16,
            padding: 18,
            gap: 18,
          }}
        >
          <ThemedText
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: warnaTeks,
            }}
          >
            Informasi Aplikasi
          </ThemedText>

          <View
            style={{
              height: 1,
              backgroundColor: warnaGaris,
            }}
          />

          {/* Nama aplikasi */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Ionicons
              name="phone-portrait-outline"
              size={24}
              color={warnaAksen}
            />

            <View style={{ flex: 1, gap: 4 }}>
              <ThemedText
                style={{
                  fontSize: 13,
                  color: warnaSekunder,
                }}
              >
                Nama Aplikasi
              </ThemedText>

              <ThemedText
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: warnaTeks,
                }}
              >
                Aplikasi Informasi Cuaca
              </ThemedText>
            </View>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: warnaGaris,
            }}
          />

          {/* Versi aplikasi */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Ionicons
              name="pricetag-outline"
              size={24}
              color="#22C55E"
            />

            <View style={{ flex: 1, gap: 4 }}>
              <ThemedText
                style={{
                  fontSize: 13,
                  color: warnaSekunder,
                }}
              >
                Versi
              </ThemedText>

              <ThemedText
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: warnaTeks,
                }}
              >
                1.0.0
              </ThemedText>
            </View>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: warnaGaris,
            }}
          />

          {/* Pembuat aplikasi */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Ionicons
              name="person-circle-outline"
              size={26}
              color="#F59E0B"
            />

            <View style={{ flex: 1, gap: 4 }}>
              <ThemedText
                style={{
                  fontSize: 13,
                  color: warnaSekunder,
                }}
              >
                Pembuat
              </ThemedText>

              <ThemedText
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: warnaTeks,
                }}
              >
                Isnaeni Kholifatun
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Footer */}
        <ThemedText
          style={{
            fontSize: 12,
            color: warnaSekunder,
            textAlign: "center",
            marginTop: 22,
          }}
        >
          Jelajah Aman · Aplikasi Informasi Cuaca
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}
