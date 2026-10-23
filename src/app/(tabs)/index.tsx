
import { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  router,
  useLocalSearchParams,
} from "expo-router";

import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import StatusData from "../../components/StatusData";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { useTheme } from "../../hooks/use-theme";

import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingService";
import {
  ambilCuacaOfflineFirst,
  BATAS_CACHE_MS,
} from "../../services/cuacaRepository";
import {
  bersihkanCacheLama,
  daftarKotaTersimpan,
} from "../../services/cacheRepository";
import { catatRiwayatPencarian } from "../../services/riwayatStorage";

import {
  mintaIzinLokasi,
  ambilKoordinatSaatIni,
} from "../../services/locationService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";

import { HasilGeocoding } from "../../../types/geocoding";
import {
  HasilCuacaOffline,
  RingkasanKotaTersimpan,
} from "../../../types/cache";

export default function HalamanUtama() {
  const { riwayatKota } = useLocalSearchParams<{
    riwayatKota?: string;
  }>();

  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] =
    useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] =
    useState<HasilGeocoding | null>(null);
  const [hasil, setHasil] =
    useState<HasilCuacaOffline | null>(null);
  const [kotaTersimpan, setKotaTersimpan] =
    useState<RingkasanKotaTersimpan[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] =
    useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] =
    useState<string | null>(null);

  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0);
  const theme = useTheme() as Record<string, string>;

  const warnaAksen = "#2f95dc";
  const warnaCard =
    theme?.background === "#000000"
      ? "#0f172a"
      : "#f8fafc";
  const warnaBorder = theme?.icon || "#334155";
  const warnaTeks = theme?.text || "#ffffff";
  const warnaSubteks = theme?.tabIconDefault || "#94a3b8";

  async function muatKotaTersimpan() {
    setKotaTersimpan(await daftarKotaTersimpan());
  }

  // Membersihkan cache yang sudah lebih dari tujuh hari.
  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS)
      .then(muatKotaTersimpan)
      .catch((error) => {
        console.error("Gagal membersihkan cache:", error);
      });
  }, []);

  // Mengisi kotak pencarian saat kota dipilih dari Riwayat.
  useEffect(() => {
    if (
      typeof riwayatKota !== "string" ||
      !riwayatKota.trim()
    ) {
      return;
    }

    setTeksCari(riwayatKota);
    setHasilPencarian([]);

    // Menghapus parameter agar kota yang sama bisa dipilih lagi.
    router.setParams({ riwayatKota: "" });
  }, [riwayatKota]);

  // Mencari kota berdasarkan teks yang diketik atau diisi otomatis.
  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }

    cariKota(teksTertunda)
      .then(setHasilPencarian)
      .catch(() => setHasilPencarian([]));
  }, [teksTertunda]);

  async function pilihKota(
    kota: HasilGeocoding,
    paksaPerbarui = false
  ) {
    setKotaTerpilih(kota);

    const idSaatIni = ++requestIdRef.current;

    setSedangMemuat(true);
    setPesanError(null);

    try {
      const data = await ambilCuacaOfflineFirst(
        {
          id: kota.id,
          nama: kota.name,
          latitude: kota.latitude,
          longitude: kota.longitude,
        },
        { paksaPerbarui }
      );

      if (idSaatIni !== requestIdRef.current) return;

      setHasil(data);

      // Catat pencarian setelah data cuaca berhasil dimuat.
      if (
        kota.id !== -1 &&
        kota.name.trim().toLowerCase() !== "lokasi saat ini"
      ) {
        try {
          await catatRiwayatPencarian({
            id: kota.id,
            nama: kota.name,
            latitude: kota.latitude,
            longitude: kota.longitude,
          });
        } catch (error) {
          console.error(
            "Gagal menyimpan riwayat pencarian:",
            error
          );
        }
      }

      await muatKotaTersimpan();
    } catch {
      if (idSaatIni !== requestIdRef.current) return;

      setHasil(null);
      setPesanError(
        "Belum ada data tersimpan dan tidak ada koneksi internet. Sambungkan internet lalu coba lagi."
      );
    } finally {
      if (idSaatIni === requestIdRef.current) {
        setSedangMemuat(false);
      }
    }
  }

  async function gunakanLokasiSaatIni() {
    try {
      const status = await mintaIzinLokasi();

      if (status === "denied") {
        setPesanLokasi(
          "Izin lokasi ditolak. Silakan cari kota secara manual di atas."
        );
        return;
      }

      if (status === "unavailable") {
        setPesanLokasi(
          "Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual."
        );
        return;
      }

      setPesanLokasi(null);

      const koordinat = await ambilKoordinatSaatIni();

      await pilihKota({
        id: -1,
        name: "Lokasi Saat Ini",
        latitude: koordinat.latitude,
        longitude: koordinat.longitude,
        country: "",
      });
    } catch {
      setPesanLokasi(
        "Lokasi tidak dapat diambil. Silakan cari kota secara manual."
      );
    }
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "transparent" }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Kotak pencarian */}
          <View style={{ gap: 12 }}>
            <SearchBox
              value={teksCari}
              onCari={setTeksCari}
            />

            <TouchableOpacity
              onPress={gunakanLokasiSaatIni}
              style={{
                backgroundColor: warnaAksen,
                paddingVertical: 12,
                paddingHorizontal: 8,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <ThemedText
                numberOfLines={
                  Platform.OS === "android" ? 1 : undefined
                }
                adjustsFontSizeToFit={
                  Platform.OS === "android"
                }
                minimumFontScale={
                  Platform.OS === "android" ? 0.7 : undefined
                }
                allowFontScaling={Platform.OS !== "android"}
                style={{
                  color: "#ffffff",
                  fontWeight: "700",
                  ...(Platform.OS === "android"
                    ? {
                        fontSize: 13,
                        lineHeight: 18,
                        textAlign: "center" as const,
                        width: "100%" as const,
                        includeFontPadding: false,
                      }
                    : {}),
                }}
              >
                GUNAKAN LOKASI SAAT INI
              </ThemedText>
            </TouchableOpacity>
          </View>

          {pesanLokasi && (
            <ThemedView
              style={{
                padding: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: warnaBorder,
                backgroundColor: warnaCard,
              }}
            >
              <ThemedText accessibilityLabel={pesanLokasi}>
                {pesanLokasi}
              </ThemedText>
            </ThemedView>
          )}

          {/* Hasil pencarian kota */}
          {hasilPencarian.length > 0 && (
            <ThemedView
              style={{
                backgroundColor: warnaCard,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: warnaBorder,
                padding: 12,
                gap: 8,
              }}
            >
              <ThemedText
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                Hasil Pencarian
              </ThemedText>

              {hasilPencarian.map((kota) => (
                <TouchableOpacity
                  key={`${kota.id}-${kota.latitude}-${kota.longitude}`}
                  onPress={() => pilihKota(kota)}
                  style={{
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: warnaBorder,
                  }}
                >
                  <ThemedText style={{ fontSize: 15 }}>
                    {kota.name}
                  </ThemedText>
                  <ThemedText
                    style={{
                      fontSize: 12,
                      opacity: 0.7,
                    }}
                  >
                    {kota.country}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>
          )}

          {/* Kota tersimpan */}
          {kotaTersimpan.length > 0 && (
            <ThemedView
              style={{
                backgroundColor: warnaCard,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: warnaBorder,
                padding: 12,
                gap: 8,
              }}
            >
              <ThemedText
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                Tersimpan di perangkat (bisa dibuka offline)
              </ThemedText>

              {kotaTersimpan.map((kota) => (
                <TouchableOpacity
                  key={kota.kunci}
                  onPress={() =>
                    pilihKota({
                      id: kota.id,
                      name: kota.nama,
                      latitude: kota.latitude,
                      longitude: kota.longitude,
                      country: "",
                    })
                  }
                  style={{
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: warnaBorder,
                  }}
                >
                  <ThemedText
                    style={{
                      fontSize: 15,
                      fontWeight: "500",
                    }}
                  >
                    {kota.nama}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>
          )}

          {sedangMemuat && (
            <ThemedView
              style={{
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
                backgroundColor: warnaCard,
                borderWidth: 1,
                borderColor: warnaBorder,
              }}
            >
              <ActivityIndicator
                size="small"
                color={warnaAksen}
              />
              <ThemedText style={{ marginTop: 8 }}>
                Memuat data cuaca...
              </ThemedText>
            </ThemedView>
          )}

          {pesanError && (
            <ThemedView
              style={{
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#f59e0b",
                backgroundColor:
                  theme?.background === "#000000"
                    ? "#1f2937"
                    : "#fff7ed",
                gap: 10,
              }}
            >
              <ThemedText accessibilityLabel={pesanError}>
                {pesanError}
              </ThemedText>

              <TouchableOpacity
                onPress={() =>
                  kotaTerpilih &&
                  pilihKota(kotaTerpilih, true)
                }
                style={{
                  backgroundColor: warnaAksen,
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <ThemedText
                  style={{
                    color: "#ffffff",
                    fontWeight: "700",
                  }}
                >
                  Coba Lagi
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}

          {hasil && kotaTerpilih && !sedangMemuat && (
            <View style={{ gap: 12 }}>
              <StatusData
                sumber={hasil.sumber}
                disimpanPada={hasil.disimpanPada}
              />

              <WeatherCard
                kota={kotaTerpilih.name}
                suhu={hasil.cuaca.saatIni.suhu}
                tingkatAQI={konversiTingkatAQI(
                  hasil.kualitasUdara.indeksAQI
                )}
              />

              <ThemedText
                style={{
                  fontSize: 13,
                  color: warnaSubteks,
                }}
              >
                Kondisi:{" "}
                {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)}{" "}
                {"\u2022"} Angin{" "}
                {hasil.cuaca.saatIni.kecepatanAngin} km/j
              </ThemedText>

              {/* Tombol perbarui */}
              <TouchableOpacity
                onPress={() =>
                  pilihKota(kotaTerpilih, true)
                }
                style={{
                  backgroundColor: warnaAksen,
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <ThemedText
                  numberOfLines={
                    Platform.OS === "android" ? 1 : undefined
                  }
                  adjustsFontSizeToFit={
                    Platform.OS === "android"
                  }
                  minimumFontScale={
                    Platform.OS === "android" ? 0.7 : undefined
                  }
                  allowFontScaling={Platform.OS !== "android"}
                  style={{
                    color: "#ffffff",
                    fontWeight: "700",
                    ...(Platform.OS === "android"
                      ? {
                          fontSize: 13,
                          lineHeight: 18,
                          textAlign: "center" as const,
                          width: "100%" as const,
                          includeFontPadding: false,
                        }
                      : {}),
                  }}
                >
                  PERBARUI SEKARANG
                </ThemedText>
              </TouchableOpacity>

              {/* Tombol favorit */}
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/tambah-favorit",
                    params: {
                      id: String(kotaTerpilih.id),
                      nama: kotaTerpilih.name,
                      lat: String(kotaTerpilih.latitude),
                      lon: String(kotaTerpilih.longitude),
                    },
                  })
                }
                style={{
                  backgroundColor: "#1d4ed8",
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <ThemedText
                  numberOfLines={
                    Platform.OS === "android" ? 1 : undefined
                  }
                  adjustsFontSizeToFit={
                    Platform.OS === "android"
                  }
                  minimumFontScale={
                    Platform.OS === "android" ? 0.7 : undefined
                  }
                  allowFontScaling={Platform.OS !== "android"}
                  style={{
                    color: "#ffffff",
                    fontWeight: "700",
                    ...(Platform.OS === "android"
                      ? {
                          fontSize: 13,
                          lineHeight: 18,
                          textAlign: "center" as const,
                          width: "100%" as const,
                          includeFontPadding: false,
                        }
                      : {}),
                  }}
                >
                  TAMBAHKAN KE FAVORIT
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          <AtribusiCuaca />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
