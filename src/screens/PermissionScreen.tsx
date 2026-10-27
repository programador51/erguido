import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Camera } from "expo-camera";
import { font, theme } from "../theme";
import {
  IconTile,
  InfoCard,
  PrimaryButton,
  SecondaryButton,
} from "../components/ui";

export function PermissionScreen({
  onGranted,
  onDenied,
}: {
  onGranted: () => void;
  onDenied: () => void;
}) {
  const insets = useSafeAreaInsets();

  const allow = async () => {
    const result = await Camera.requestCameraPermissionsAsync();
    if (result.granted) onGranted();
    else onDenied();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 28 }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <IconTile name="camera-outline" tone="green" />
        <Text style={styles.title}>Cámara frontal</Text>
        <Text style={styles.body}>
          Erguido la enciende solo durante la pausa, para dibujar la guía sobre
          tu imagen. No mide la columna ni guarda el video.
        </Text>
        <View style={styles.cards}>
          <InfoCard
            icon="person-outline"
            title="Cabeza y hombros"
            detail="Hace falta ver la nariz y los hombros."
          />
          <InfoCard
            icon="time-outline"
            title="Unos veinte segundos"
            detail="Después la cámara se cierra sola."
          />
          <InfoCard
            icon="lock-closed-outline"
            title="Se queda en el teléfono"
            detail="El video no se envía ni se publica."
          />
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton label="Permitir cámara" onPress={() => void allow()} />
        <SecondaryButton label="Ahora no" onPress={onDenied} />
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
  cards: {
    gap: 10,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 10,
  },
});
