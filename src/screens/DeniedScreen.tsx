import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { font, theme } from "../theme";
import { IconTile, PrimaryButton } from "../components/ui";

export function DeniedScreen({ onHome }: { onHome: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 28 }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <IconTile name="close" tone="pain" />
        <Text style={styles.title}>Sin cámara no hay guía</Text>
        <Text style={styles.body}>
          El permiso se negó. Erguido necesita la cámara frontal para encuadrar
          la cabeza y los hombros. Sin ella, la revisión no puede empezar.
        </Text>
        <View style={styles.callout}>
          <Text style={styles.calloutText}>
            Puedes activar la cámara en los ajustes del teléfono y volver a
            intentarlo.
          </Text>
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton label="Volver al inicio" onPress={onHome} />
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
  title: {
    color: theme.ink,
    fontFamily: font.serif,
    fontSize: 34,
    lineHeight: 40,
  },
  body: {
    color: theme.body,
    fontFamily: font.sans,
    fontSize: 16,
    lineHeight: 23,
    marginTop: -6,
  },
  callout: {
    backgroundColor: theme.painBg,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: -4,
  },
  calloutText: {
    color: theme.pain,
    fontFamily: font.sansMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
});
