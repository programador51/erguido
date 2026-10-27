import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Reading } from "../posture";
import { font, theme } from "../theme";
import { PainNotice } from "./ui";

type CardCopy = {
  title: string;
  detail: string;
  active: boolean;
  tone: "head" | "shoulders";
};

function copyFor(reading: Reading): {
  title: string;
  aside: string;
  head: CardCopy;
  shoulders: CardCopy;
} {
  if (!reading.detected) {
    return {
      title: "La misma guía",
      aside: "Sigue el conteo",
      head: {
        title: "Lleva la coronilla hacia arriba",
        detail: "Mismo texto, sin medición",
        active: true,
        tone: "head",
      },
      shoulders: {
        title: "Baja los hombros y llévalos atrás",
        detail: "Mismo texto, sin medición",
        active: true,
        tone: "shoulders",
      },
    };
  }
  if (reading.head && reading.shoulders) {
    return {
      title: "Dos avisos",
      aside: "Pueden salir juntos",
      head: {
        title: "Lleva la coronilla hacia arriba",
        detail: "La cabeza se adelantó",
        active: true,
        tone: "head",
      },
      shoulders: {
        title: "Baja los hombros y llévalos atrás",
        detail: "Los hombros están altos",
        active: true,
        tone: "shoulders",
      },
    };
  }
  if (reading.head) {
    return {
      title: "Aviso de cabeza",
      aside: "Hombros en su lugar",
      head: {
        title: "Lleva la coronilla hacia arriba",
        detail: "La cabeza se adelantó",
        active: true,
        tone: "head",
      },
      shoulders: {
        title: "Hombros sin aviso",
        detail: "No hace falta bajarlos ahora",
        active: false,
        tone: "shoulders",
      },
    };
  }
  if (reading.shoulders) {
    return {
      title: "Aviso de hombros",
      aside: "Cabeza en su lugar",
      head: {
        title: "Cabeza sin aviso",
        detail: "La coronilla ya está arriba",
        active: false,
        tone: "head",
      },
      shoulders: {
        title: "Baja los hombros y llévalos atrás",
        detail: "Los hombros están altos",
        active: true,
        tone: "shoulders",
      },
    };
  }
  return {
    title: "En su lugar",
    aside: "Sigue la pausa",
    head: {
      title: "Cabeza sin aviso",
      detail: "La coronilla ya está arriba",
      active: false,
      tone: "head",
    },
    shoulders: {
      title: "Hombros sin aviso",
      detail: "No hace falta bajarlos ahora",
      active: false,
      tone: "shoulders",
    },
  };
}

export function ReviewSheet({
  reading,
  ready,
}: {
  reading: Reading;
  ready: boolean;
}) {
  const copy = ready
    ? copyFor(reading)
    : {
        title: "Preparando la guía",
        aside: "Unos veinte segundos",
        head: {
          title: "Lleva la coronilla hacia arriba",
          detail: "Aparece si la cabeza se adelanta",
          active: false,
          tone: "head" as const,
        },
        shoulders: {
          title: "Baja los hombros y llévalos atrás",
          detail: "Aparece si los hombros suben",
          active: false,
          tone: "shoulders" as const,
        },
      };
  return (
    <View style={styles.sheet}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{copy.title}</Text>
        <Text style={styles.headerAside}>{copy.aside}</Text>
      </View>
      <CueCard card={copy.head} />
      <CueCard card={copy.shoulders} />
      <PainNotice inline />
      <Text style={styles.privacy}>
        Sin grados ni puntaje. El video no se guarda.
      </Text>
    </View>
  );
}

function CueCard({ card }: { card: CardCopy }) {
  const tint = card.tone === "head" ? theme.head : theme.shoulder;
  return (
    <View
      style={[
        styles.card,
        card.active
          ? card.tone === "head"
            ? styles.headCard
            : styles.shoulderCard
          : styles.inactiveCard,
      ]}
    >
      <View style={[styles.icon, { backgroundColor: card.active ? theme.white : theme.line }]}>
        <Ionicons
          name={
            card.active
              ? card.tone === "head"
                ? "arrow-up"
                : "arrow-down"
              : "remove"
          }
          size={18}
          color={card.active ? tint : theme.muted}
        />
      </View>
      <View style={styles.cardCopy}>
        <Text style={[styles.cardTitle, !card.active && styles.inactiveText]}>
          {card.title}
        </Text>
        <Text style={styles.cardDetail}>{card.detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 12,
  },
  headerTitle: {
    color: theme.ink,
    fontFamily: font.sansSemi,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  headerAside: {
    color: theme.muted,
    fontFamily: font.sans,
    fontSize: 13,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headCard: {
    backgroundColor: theme.headCard,
  },
  shoulderCard: {
    backgroundColor: theme.shoulderCard,
  },
  inactiveCard: {
    backgroundColor: theme.inactiveCard,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardCopy: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    color: theme.ink,
    fontFamily: font.sansSemi,
    fontSize: 15,
  },
  inactiveText: {
    color: theme.body,
  },
  cardDetail: {
    color: theme.muted,
    fontFamily: font.sans,
    fontSize: 13,
  },
  privacy: {
    color: theme.muted,
    fontFamily: font.sans,
    fontSize: 13,
  },
});
