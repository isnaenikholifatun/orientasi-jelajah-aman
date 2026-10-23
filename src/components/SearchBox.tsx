import { View, TextInput } from "react-native";
import { useTheme } from "../hooks/use-theme";

interface SearchBoxProps {
  value: string;
  onCari: (teks: string) => void;
}

export default function SearchBox({
  value,
  onCari,
}: SearchBoxProps) {
  const theme = useTheme() as Record<string, string>;

  return (
    <View>
      <TextInput
        placeholder="Cari nama kota..."
        placeholderTextColor={theme?.icon || "#888888"}
        value={value}
        onChangeText={onCari}
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
