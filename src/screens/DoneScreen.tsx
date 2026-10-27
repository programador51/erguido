import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Camera } from "expo-camera";
import { font, theme } from "../theme";
import {
  PainNotice,
  PrimaryButton,
  SecondaryButton,
} from "../components/ui";

const ROWS = [
  ["Duración", "20 segundos"],
  ["Cámara", "Cerrada"],
  ["Video", "No guardado"],
] as const;

export function DoneScreen({
  onRepeat,
  onHome,
}: {
  onRepeat: (granted: boolean) => void;
  onHome: () => void;
}) {
  const insets = useSafeAreaInsets();

  const repeat = async () => {
    const permission = await Camera.getCameraPermissionsAsync();
    onRepeat(permission.granted);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 28 }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.check}>
          <Ionicons name="checkmark" size={40} color={theme.green} />
        </View>
        <Text style={styles.title}>Pausa terminada</Text>
        <Text style={styles.body}>
          La revisión llegó a su fin y la cámara se cerró. El video no se guardó
          ni salió del teléfono.
        </Text>
        <View style={styles.card}>
          {ROWS.map(([label, value], index) => (
            <View key={label}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{label}</Text>
                <Text style={styles.rowValue}>{value}</Text>
              </View>
            </View>
          ))}
        </View>
        <PainNotice />
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton label="Repetir revisión" onPress={() => void repeat()} />
        <SecondaryButton label="Volver al inicio" onPress={onHome} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 16,
  },
  check: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#D7EBE4",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: theme.ink,
    fontFamily: font.serif,
    fontSize: 36,
    lineHeight: 42,
  },
  body: {
    color: theme.body,
    fontFamily: font.sans,
    fontSize: 16,
    lineHeight: 23,
    marginTop: -6,
  },
  card: {
    backgroundColor: theme.white,
    borderRadius: 18,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  rowLabel: {
    color: theme.muted,
    fontFamily: font.sans,
    fontSize: 15,
  },
  rowValue: {
    color: theme.ink,
    fontFamily: font.sansSemi,
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: theme.line,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 10,
  },
});
