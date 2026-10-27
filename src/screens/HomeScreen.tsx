import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { font, theme } from "../theme";
import { HomeArt } from "../components/HomeArt";
import { LockLine, PainNotice, PrimaryButton } from "../components/ui";

const STEPS = [
  "Apóyalo en vertical, de frente, sin sostenerlo.",
  "Encuadra la cabeza y los hombros con la cámara frontal.",
  "La revisión dura unos veinte segundos y luego se cierra.",
];

export function HomeScreen({ onStart }: { onStart: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.kicker}>Pausa de postura</Text>
        <Text style={styles.title}>Erguido</Text>
        <Text style={styles.lead}>
          Una guía de unos veinte segundos sobre tu propia imagen. Sin puntaje y
          sin diagnóstico.
        </Text>
        <HomeArt />
        <Text style={styles.section}>Cómo apoyar el teléfono</Text>
        <View style={styles.steps}>
          {STEPS.map((step, index) => (
            <View key={step} style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
        <PainNotice />
        <LockLine>El video no se guarda ni sale del teléfono.</LockLine>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton label="Comenzar revisión" onPress={onStart} />
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
  kicker: {
    color: theme.green,
    fontFamily: font.sansSemi,
    fontSize: 13,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  title: {
    color: theme.ink,
    fontFamily: font.serif,
    fontSize: 42,
    lineHeight: 48,
    marginTop: -8,
  },
  lead: {
    color: theme.body,
    fontFamily: font.sans,
    fontSize: 16,
    lineHeight: 23,
  },
  section: {
    color: theme.ink,
    fontFamily: font.sansSemi,
    fontSize: 18,
  },
  steps: {
    gap: 12,
    marginTop: -6,
  },
  step: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.ink,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepNumber: {
    color: theme.white,
    fontFamily: font.sansSemi,
    fontSize: 12,
  },
  stepText: {
    flex: 1,
    color: theme.body,
    fontFamily: font.sans,
    fontSize: 15,
    lineHeight: 21,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 10,
    backgroundColor: theme.bg,
  },
});
