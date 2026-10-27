import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { font, theme } from "../theme";

export function PrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
    >
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
    >
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

export function PainNotice({ inline = false }: { inline?: boolean }) {
  if (inline) {
    return (
      <Text style={styles.painInline}>
        Es una guía de pausa. Detente si aparece dolor de cuello o de espalda.
      </Text>
    );
  }

  return (
    <View style={styles.painCard}>
      <Ionicons name="alert-circle" size={18} color={theme.pain} />
      <Text style={styles.painText}>
        Es una guía de pausa. Detente si aparece dolor de cuello o de espalda.
      </Text>
    </View>
  );
}

export function LockLine({ children }: { children: string }) {
  return (
    <View style={styles.lockRow}>
      <Ionicons name="lock-closed" size={15} color={theme.muted} />
      <Text style={styles.lockText}>{children}</Text>
    </View>
  );
}

export function IconTile({
  name,
  tone,
}: {
  name: keyof typeof Ionicons.glyphMap;
  tone: "green" | "pain";
}) {
  return (
    <View style={[styles.tile, tone === "pain" ? styles.tilePain : styles.tileGreen]}>
      <Ionicons
        name={name}
        size={32}
        color={tone === "pain" ? theme.pain : theme.green}
      />
    </View>
  );
}

export function InfoCard({
  icon,
  title,
  detail,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
}) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={theme.green} />
      </View>
      <View style={styles.infoCopy}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoDetail}>{detail}</Text>
      </View>
    </View>
  );
}

export function ScreenTitle({
  kicker,
  title,
  children,
}: {
  kicker?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <View style={styles.titleBlock}>
      {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  primary: {
    height: 56,
    borderRadius: 18,
    backgroundColor: theme.green,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    color: theme.white,
    fontFamily: font.sansSemi,
    fontSize: 16,
  },
  secondary: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: theme.secondaryBorder,
    backgroundColor: theme.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    color: theme.green,
    fontFamily: font.sansSemi,
    fontSize: 16,
  },
  pressed: {
    opacity: 0.86,
  },
  painCard: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: theme.painBg,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  painText: {
    flex: 1,
    color: theme.pain,
    fontFamily: font.sansMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  painInline: {
    color: theme.painInline,
    fontFamily: font.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  lockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  lockText: {
    flex: 1,
    color: theme.muted,
    fontFamily: font.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  tile: {
    width: 84,
    height: 84,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  tileGreen: {
    backgroundColor: theme.greenSoft,
  },
  tilePain: {
    backgroundColor: theme.painBg,
  },
  infoCard: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: theme.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCopy: {
    flex: 1,
    gap: 2,
  },
  infoTitle: {
    color: theme.ink,
    fontFamily: font.sansSemi,
    fontSize: 15,
  },
  infoDetail: {
    color: theme.muted,
    fontFamily: font.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  titleBlock: {
    gap: 8,
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
    fontSize: 40,
    lineHeight: 46,
  },
});
