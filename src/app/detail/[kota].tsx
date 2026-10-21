// src/app/detail/[kota].tsx
import { useState, useEffect } from "react";
import { View, Button, ActivityIndicator, Text } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

import WeatherCard from "../../components/WeatherCard";
import StatusData from "../../components/StatusData";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import { cariKota } from "../../services/geocodingService";
import { ambilCuacaOfflineFirst } from "../../services/cuacaRepository";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { HasilCuacaOffline } from "../../../types/cache";

export default function HalamanDetail() {
  const { kota, id, lat, lon } = useLocalSearchParams<{ 
    kota: string; 
    id?: string; 
    lat?: string; 
    lon?: string; 
  }>();

  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [pesanError, setPesanError] = useState<string | null>(null);

  useEffect(() => {
    async function ambilData() {
      if (!kota) return;
      setSedangMemuat(true);
      setPesanError(null);

      try {
        let kotaId = id ? Number(id) : 0;
        let latitude = lat ? Number(lat) : 0;
        let longitude = lon ? Number(lon) : 0;
        let namaKota = kota;

        // Jika data koordinat belum ada dari URL, coba cari lewat Geocoding (Online)
        if (!latitude || !longitude) {
          try {
            const daftarKota = await cariKota(kota);
            if (daftarKota && daftarKota.length > 0) {
              kotaId = daftarKota[0].id;
              latitude = daftarKota[0].latitude;
              longitude = daftarKota[0].longitude;
              namaKota = daftarKota[0].name;
            }
          } catch (geoError) {
            // Abaikan error geocoding jika sedang offline
            console.log("Geocoding gagal (offline mode)");
          }
        }

        // Ambil data cuaca (Offline First akan mengecek AsyncStorage jika internet mati)
        const dataCuaca = await ambilCuacaOfflineFirst({
          id: kotaId,
          nama: namaKota,
          latitude: latitude,
          longitude: longitude,
        });

        setHasil(dataCuaca);
      } catch (err) {
        setPesanError("Belum ada data tersimpan untuk kota ini saat offline.");
      } finally {
        setSedangMemuat(false);
      }
    }

    ambilData();
  }, [kota, id, lat, lon]);

  return (
    <View style={{ padding: 16, gap: 16 }}>
      {sedangMemuat && <ActivityIndicator size="large" color="#007AFF" />}

      {pesanError && <Text style={{ color: "red" }}>{pesanError}</Text>}

      {hasil && !sedangMemuat && (
        <>
          <StatusData sumber={hasil.sumber} disimpanPada={hasil.disimpanPada} />
          
          <WeatherCard
            kota={kota}
            suhu={hasil.cuaca.saatIni.suhu}
            tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
          />

          <Text style={{ fontSize: 12, color: "#888888" }}>
            Kondisi: {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)} {"\u2022"} Angin{" "}
            {hasil.cuaca.saatIni.kecepatanAngin} km/j
          </Text>
        </>
      )}

      <Button
        title="Tambahkan ke Favorit"
        onPress={() => router.push("/tambah-favorit")}
      />

      <AtribusiCuaca />
    </View>
  );
}