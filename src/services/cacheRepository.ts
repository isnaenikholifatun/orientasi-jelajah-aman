import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DataCuacaLengkap,
  DataKualitasUdara,
} from "../../types/weather";
import {
  DataTersimpan,
  KotaUntukCache,
  RingkasanKotaTersimpan,
} from "../../types/cache";

const CACHE_KEY = "@jelajah_aman_cache";

interface BarisCache {
  kunci: string;
  kota_id: number;
  nama_kota: string;
  latitude: number;
  longitude: number;
  cuaca_json: string;
  aqi_json: string;
  disimpan_pada: number;
}

// Membuat kunci cache berdasarkan koordinat kota.
export function buatKunci(
  latitude: number,
  longitude: number
): string {
  return `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
}

// Membaca seluruh cache dari AsyncStorage.
async function ambilSemuaDataCache(): Promise<
  Record<string, BarisCache>
> {
  try {
    const jsonValue = await AsyncStorage.getItem(CACHE_KEY);

    if (!jsonValue) return {};

    const data: unknown = JSON.parse(jsonValue);

    if (
      data === null ||
      typeof data !== "object" ||
      Array.isArray(data)
    ) {
      return {};
    }

    return data as Record<string, BarisCache>;
  } catch (error) {
    console.error("Gagal membaca cache:", error);
    return {};
  }
}

// Menyimpan kembali seluruh cache.
async function simpanSemuaDataCache(
  data: Record<string, BarisCache>
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify(data)
    );
  } catch (error) {
    console.error("Gagal menyimpan cache:", error);
    throw error;
  }
}

// Menyimpan atau memperbarui cache cuaca sebuah kota.
export async function simpanCache(
  kota: KotaUntukCache,
  cuaca: DataCuacaLengkap,
  kualitasUdara: DataKualitasUdara
): Promise<void> {
  const data = await ambilSemuaDataCache();
  const kunci = buatKunci(
    kota.latitude,
    kota.longitude
  );

  data[kunci] = {
    kunci,
    kota_id: kota.id,
    nama_kota: kota.nama,
    latitude: kota.latitude,
    longitude: kota.longitude,
    cuaca_json: JSON.stringify(cuaca),
    aqi_json: JSON.stringify(kualitasUdara),
    disimpan_pada: Date.now(),
  };

  await simpanSemuaDataCache(data);
}

// Mengambil cache berdasarkan koordinat.
export async function ambilCache(
  latitude: number,
  longitude: number
): Promise<DataTersimpan | null> {
  const data = await ambilSemuaDataCache();
  const kunci = buatKunci(latitude, longitude);
  const baris = data[kunci];

  if (!baris) return null;

  try {
    return {
      cuaca: JSON.parse(
        baris.cuaca_json
      ) as DataCuacaLengkap,
      kualitasUdara: JSON.parse(
        baris.aqi_json
      ) as DataKualitasUdara,
      disimpanPada: baris.disimpan_pada,
    };
  } catch (error) {
    console.error("Gagal membaca data cache kota:", error);
    return null;
  }
}

// Menampilkan maksimal lima kota yang terakhir diperbarui.
export async function daftarKotaTersimpan(): Promise<
  RingkasanKotaTersimpan[]
> {
  const data = await ambilSemuaDataCache();

  const semuaBaris = Object.values(data).sort(
    (a, b) => b.disimpan_pada - a.disimpan_pada
  );

  return semuaBaris.slice(0, 5).map((baris) => ({
    kunci: baris.kunci,
    id: baris.kota_id,
    nama: baris.nama_kota,
    latitude: baris.latitude,
    longitude: baris.longitude,
    disimpanPada: baris.disimpan_pada,
  }));
}

// Menghapus cache berdasarkan koordinat.
// Fungsi ini tetap digunakan oleh daftar Cache Cuaca Tersimpan.
export async function hapusCacheKota(
  latitude: number,
  longitude: number
): Promise<void> {
  const data = await ambilSemuaDataCache();
  const kunci = buatKunci(latitude, longitude);

  if (!data[kunci]) return;

  delete data[kunci];

  await simpanSemuaDataCache(data);
}

// Fungsi khusus untuk menghapus cache dari Riwayat Pencarian.
export async function hapusCacheKotaDariRiwayat(
  latitude: number,
  longitude: number,
  kotaId: number,
  namaKota: string
): Promise<boolean> {
  const data = await ambilSemuaDataCache();
  const targetKunci = buatKunci(latitude, longitude);

  // Prioritas 1: cocokkan koordinat kota.
  let kunciDihapus = Object.entries(data)
    .filter(
      ([kunci, baris]) =>
        kunci === targetKunci ||
        buatKunci(baris.latitude, baris.longitude) ===
          targetKunci
    )
    .map(([kunci]) => kunci);

  // Prioritas 2: jika koordinat tidak cocok, cocokkan ID.
  if (kunciDihapus.length === 0 && kotaId !== -1) {
    kunciDihapus = Object.entries(data)
      .filter(([, baris]) => baris.kota_id === kotaId)
      .map(([kunci]) => kunci);
  }

  // Prioritas 3: jika ID tidak cocok, cocokkan nama.
  if (kunciDihapus.length === 0) {
    const namaNormal = namaKota.trim().toLowerCase();

    kunciDihapus = Object.entries(data)
      .filter(
        ([, baris]) =>
          baris.nama_kota.trim().toLowerCase() === namaNormal
      )
      .map(([kunci]) => kunci);
  }

  // Tidak menghapus data apa pun jika cache tidak ditemukan.
  if (kunciDihapus.length === 0) {
    return false;
  }

  // Hapus hanya entri cache yang cocok.
  for (const kunci of kunciDihapus) {
    delete data[kunci];
  }

  await simpanSemuaDataCache(data);

  // Verifikasi hasil penghapusan.
  const dataTerbaru = await ambilSemuaDataCache();

  const masihAda = kunciDihapus.some((kunci) =>
    Object.prototype.hasOwnProperty.call(dataTerbaru, kunci)
  );

  return !masihAda;
}

// Menghapus cache yang sudah melewati batas umur.
export async function bersihkanCacheLama(
  batasUmurMs: number
): Promise<void> {
  const data = await ambilSemuaDataCache();
  const batasWaktu = Date.now() - batasUmurMs;

  let adaPerubahan = false;

  for (const kunci of Object.keys(data)) {
    if (data[kunci].disimpan_pada < batasWaktu) {
      delete data[kunci];
      adaPerubahan = true;
    }
  }

  if (adaPerubahan) {
    await simpanSemuaDataCache(data);
  }
}

// Menghapus seluruh cache cuaca.
export async function hapusSemuaCache(): Promise<void> {
  await AsyncStorage.removeItem(CACHE_KEY);
}
