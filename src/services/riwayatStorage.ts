
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KotaFavorit } from "../../types/favorit";

const KUNCI_RIWAYAT = "@jelajah_aman:riwayat_pencarian";

export async function ambilRiwayatPencarian(): Promise<KotaFavorit[]> {
  const json = await AsyncStorage.getItem(KUNCI_RIWAYAT);

  if (!json) return [];

  try {
    const data = JSON.parse(json);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function catatRiwayatPencarian(
  kota: KotaFavorit
): Promise<void> {
  const riwayat = await ambilRiwayatPencarian();
  const namaNormal = kota.nama.trim().toLowerCase();

  // Hilangkan kota yang sama agar tidak ada duplikat.
  const tanpaDuplikat = riwayat.filter(
    (item) =>
      item.id !== kota.id &&
      item.nama.trim().toLowerCase() !== namaNormal
  );

  // Kota terbaru diletakkan paling atas.
  const riwayatBaru = [
    { ...kota, nama: kota.nama.trim() },
    ...tanpaDuplikat,
  ].slice(0, 10);

  await AsyncStorage.setItem(
    KUNCI_RIWAYAT,
    JSON.stringify(riwayatBaru)
  );
}
