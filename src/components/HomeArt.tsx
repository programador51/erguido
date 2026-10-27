import { StyleSheet, View } from "react-native";
import Svg, { Circle, Ellipse, Rect } from "react-native-svg";
import { theme } from "../theme";

export function HomeArt() {
  return (
    <View style={styles.card}>
      <Svg width="100%" height="100%" viewBox="0 0 342 168">
        <Rect x="78" y="128" width="70" height="12" rx="3" fill="#163E34" />
        <Rect x="84" y="116" width="58" height="14" rx="3" fill={theme.green} />
        <Rect x="96" y="46" width="34" height="68" rx="6" fill="#1C2824" />
        <Rect x="99" y="52" width="28" height="52" rx="3" fill="#F7F4EE" />
        <Circle cx="113" cy="70" r="7" fill="#E7C2A4" />
        <Rect x="104" y="78" width="18" height="16" rx="4" fill="#7EB0D4" />
        <Ellipse cx="236" cy="62" rx="34" ry="30" fill="#8B5E3C" />
        <Circle cx="236" cy="70" r="24" fill="#E7C2A4" />
        <Ellipse cx="236" cy="58" rx="26" ry="16" fill="#8B5E3C" />
        <Rect x="214" y="96" width="44" height="18" rx="8" fill="#E7C2A4" />
        <Rect x="176" y="108" width="122" height="60" rx="28" fill="#3E6B5C" />
        <Rect x="214" y="108" width="46" height="16" rx="8" fill="#355E51" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 168,
    borderRadius: 22,
    backgroundColor: theme.greenSoft,
    overflow: "hidden",
  },
});
