// src/services/favoritStorage.ts 
import AsyncStorage from "@react-native-async-storage/async-storage"; 
import { KotaFavorit } from "../../types/favorit"; 

const KUNCI_PENYIMPANAN = "@jelajah_aman:favorit"; 

export async function ambilSemuaFavorit(): Promise<KotaFavorit[]> { 
  const json = await AsyncStorage.getItem(KUNCI_PENYIMPANAN); 
  return json ? JSON.parse(json) : []; 
} 

export async function tambahFavorit(kota: KotaFavorit): Promise<void> { 
  const daftar = await ambilSemuaFavorit(); 
  
  // 1. Hapus jika kota sudah ada sebelumnya (agar tidak duplikat)
  const daftarTanpaKotaIni = daftar.filter((k) => k.id !== kota.id && k.nama.toLowerCase() !== kota.nama.toLowerCase()); 
  
  // 2. Tambahkan kota baru di paling depan (pencarian terbaru)
  let daftarBaru = [kota, ...daftarTanpaKotaIni]; 

  // 3. TUGAS 2: Batasi maksimal 10 pencarian terakhir
  if (daftarBaru.length > 10) {
    daftarBaru = daftarBaru.slice(0, 10);
  }

  await AsyncStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(daftarBaru)); 
} 

export async function hapusFavorit(id: number): Promise<void> { 
  const daftar = await ambilSemuaFavorit(); 
  const daftarBaru = daftar.filter((k) => k.id !== id); 
  await AsyncStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(daftarBaru)); 
}