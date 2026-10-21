// src/services/cacheRepository.ts 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DataCuacaLengkap, DataKualitasUdara } from "../../types/weather"; 
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
  
// Koordinat dibulatkan 2 desimal (~1,1 km) agar GPS yang bergeser sedikit 
// tetap memakai cache yang sama 
export function buatKunci(latitude: number, longitude: number): string { 
  return latitude.toFixed(2) + "," + longitude.toFixed(2); 
} 

// Fungsi pembantu untuk mengambil semua data cache dari AsyncStorage
async function ambilSemuaDataCache(): Promise<Record<string, BarisCache>> {
  try {
    const jsonValue = await AsyncStorage.getItem(CACHE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : {};
  } catch (e) {
    return {};
  }
}

// Fungsi pembantu untuk menyimpan data cache kembali ke AsyncStorage
async function simpanSemuaDataCache(data: Record<string, BarisCache>): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Gagal menyimpan cache", e);
  }
}
  
export async function simpanCache( 
  kota: KotaUntukCache, 
  cuaca: DataCuacaLengkap, 
  kualitasUdara: DataKualitasUdara 
): Promise<void> { 
  const data = await ambilSemuaDataCache();
  const kunci = buatKunci(kota.latitude, kota.longitude);

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
  
export async function ambilCache( 
  latitude: number, 
  longitude: number 
): Promise<DataTersimpan | null> { 
  const data = await ambilSemuaDataCache();
  const kunci = buatKunci(latitude, longitude);
  const baris = data[kunci];

  if (!baris) return null; 
  
  return { 
    cuaca: JSON.parse(baris.cuaca_json) as DataCuacaLengkap,
    kualitasUdara: JSON.parse(baris.aqi_json) as DataKualitasUdara, 
    disimpanPada: baris.disimpan_pada, 
  }; 
} 
  
export async function daftarKotaTersimpan(): Promise<RingkasanKotaTersimpan[]> { 
  const data = await ambilSemuaDataCache();
  const semuaBaris = Object.values(data);

  // Urutkan dari yang terbaru (descending)
  semuaBaris.sort((a, b) => b.disimpan_pada - a.disimpan_pada);

  // Ambil maksimal 5 data
  const limit5 = semuaBaris.slice(0, 5);

  return limit5.map((b) => ({ 
    kunci: b.kunci, 
    id: b.kota_id, 
    nama: b.nama_kota, 
    latitude: b.latitude, 
    longitude: b.longitude, 
    disimpanPada: b.disimpan_pada, 
  })); 
} 
  
// Invalidation otomatis: buang cache yang lebih tua dari batas umur 
export async function bersihkanCacheLama(batasUmurMs: number): Promise<void> { 
  const data = await ambilSemuaDataCache();
  const batasWaktu = Date.now() - batasUmurMs;
  let adaPerubahan = false;

  for (const kunci in data) {
    if (data[kunci].disimpan_pada < batasWaktu) {
      delete data[kunci];
      adaPerubahan = true;
    }
  }

  if (adaPerubahan) {
    await simpanSemuaDataCache(data);
  }
} 
  
// Invalidation manual: kosongkan seluruh cache 
export async function hapusSemuaCache(): Promise<void> { 
  await AsyncStorage.removeItem(CACHE_KEY);
}