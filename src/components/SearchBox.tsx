// src/components/SearchBox.tsx 
import { useState } from "react"; 
import { View, TextInput } from "react-native"; 
import { useTheme } from "../hooks/use-theme";
  
interface SearchBoxProps { 
  onCari: (teks: string) => void; 
} 
  
export default function SearchBox({ onCari }: SearchBoxProps) { 
  const [teks, setTeks] = useState(""); 
  const theme = useTheme() as Record<string, string>;
  
  function handleChange(nilaiBaru: string) { 
    setTeks(nilaiBaru); 
    onCari(nilaiBaru); 
  } 
  
  return ( 
    <View> 
      <TextInput 
        placeholder="Cari nama kota..." 
        placeholderTextColor={theme?.icon || "#888888"}
        value={teks} 
        onChangeText={handleChange} 
        accessibilityLabel="Cari cuaca untuk kota yang dimasukkan" 
        style={{ 
          borderWidth: 1, 
          padding: 8, 
          borderRadius: 8,
          color: theme?.text || "#000000",
          backgroundColor: theme?.background || "#FFFFFF",
          borderColor: theme?.icon || "#CCCCCC",
        }} 
      /> 
    </View> 
  ); 
}