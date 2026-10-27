import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Line, Path } from "react-native-svg";
import {
  GUIDE_BONES,
  MIN_SCORE,
  SESSION_MS,
  canonicalName,
  type BoneGroup,
  type Joint,
  type Reading,
} from "../posture";
import { font, theme } from "../theme";

/** Good seated posture, in the same 0–1 frame as the live skeleton. */
const SILHOUETTE: Record<string, [number, number]> = {
  nose: [0.5, 0.2],
  left_eye: [0.45, 0.17],
  right_eye: [0.55, 0.17],
  left_ear: [0.38, 0.19],
  right_ear: [0.62, 0.19],
  left_shoulder: [0.26, 0.42],
  right_shoulder: [0.74, 0.42],
  left_elbow: [0.14, 0.64],
  right_elbow: [0.86, 0.64],
};

function jointMap(joints: Joint[]): Map<string, Joint> {
  const map = new Map<string, Joint>();
  for (const joint of joints) {
    if (joint.score >= MIN_SCORE) map.set(canonicalName(joint.name), joint);
  }
  return map;
}

function boneColor(group: BoneGroup, reading: Reading): string {
  if (group === "head" && reading.head) return theme.head;
  if (group === "shoulders" && reading.shoulders) return theme.shoulderLine;
  return theme.bone;
}

export function formatClock(elapsedMs: number): string {
  const seconds = Math.min(20, Math.floor(elapsedMs / 1000));
  return `0:${String(seconds).padStart(2, "0")}`;
}

export function PoseOverlay({
  width,
  height,
  reading,
  elapsedMs,
  ready,
}: {
  width: number;
  height: number;
  reading: Reading;
  elapsedMs: number;
  ready: boolean;
}) {
  if (width <= 0 || height <= 0) return null;
  const progress = ready ? Math.min(1, elapsedMs / SESSION_MS) : 0;
  const points = jointMap(reading.keypoints);
  const showGuide = ready && reading.detected;
  const showMissing = ready && !reading.detected;

  return (
    <View style={styles.fill} pointerEvents="none">
      <Svg width={width} height={height}>
        <Brackets width={width} height={height} />
        <Silhouette width={width} height={height} />
        {showGuide
          ? GUIDE_BONES.map(([from, to, group]) => {
              const start = points.get(from);
              const end = points.get(to);
              if (!start || !end) return null;
              return (
                <Line
                  key={`${from}-${to}`}
                  x1={start.x * width}
                  y1={start.y * height}
                  x2={end.x * width}
                  y2={end.y * height}
                  stroke={boneColor(group, reading)}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
              );
            })
          : null}
        {showGuide
          ? [...points.values()].map((point) => (
              <Circle
                key={canonicalName(point.name)}
                cx={point.x * width}
                cy={point.y * height}
                r={5}
                fill={theme.joint}
                stroke={theme.white}
                strokeWidth={2}
              />
            ))
          : null}
      </Svg>

      <View style={styles.topRow}>
        <View style={styles.cameraPill}>
          <Text style={styles.cameraPillText}>
            {showMissing ? "Sin detección" : "Cámara frontal"}
          </Text>
        </View>
        <View style={styles.timerPill}>
          <TimerRing
            progress={progress}
            color={showMissing ? theme.head : theme.green}
          />
          <Text style={styles.timerValue}>{formatClock(ready ? elapsedMs : 0)}</Text>
          <Text style={styles.timerTotal}> de 0:20</Text>
        </View>
      </View>

      <View style={styles.tag}>
        <Text style={styles.tagText}>Guía sobre tu imagen</Text>
      </View>

      {showMissing ? (
        <View style={styles.missing}>
          <Text style={styles.missingTitle}>
            No se leen la nariz ni los hombros
          </Text>
          <Text style={styles.missingBody}>
            Poca luz o encuadre incompleto. Sigue la silueta erguida. La pausa
            continúa.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function Brackets({ width, height }: { width: number; height: number }) {
  const inset = 16;
  const arm = 22;
  const right = width - inset;
  const bottom = height - inset;
  const d = [
    `M ${inset + arm} ${inset} H ${inset} V ${inset + arm}`,
    `M ${right - arm} ${inset} H ${right} V ${inset + arm}`,
    `M ${inset} ${bottom - arm} V ${bottom} H ${inset + arm}`,
    `M ${right} ${bottom - arm} V ${bottom} H ${right - arm}`,
  ].join(" ");
  return (
    <Path
      d={d}
      stroke="rgba(255,255,255,0.82)"
      strokeWidth={2}
      fill="none"
      strokeLinecap="round"
    />
  );
}

function Silhouette({ width, height }: { width: number; height: number }) {
  const box = Math.min(width * 0.78, height * 0.72);
  const left = (width - box) / 2;
  const top = Math.max(28, (height - box) * 0.18);
  const at = (name: string) => {
    const point = SILHOUETTE[name];
    return { x: left + point[0] * box, y: top + point[1] * box };
  };
  const nose = at("nose");
  const leftShoulder = at("left_shoulder");
  const rightShoulder = at("right_shoulder");
  const headRadius = box * 0.11;
  return (
    <G opacity={0.5}>
      <Circle
        cx={nose.x}
        cy={top + box * 0.16}
        r={headRadius}
        stroke={theme.ghost}
        strokeWidth={2}
        fill="rgba(215,235,227,0.16)"
      />
      <Line
        x1={nose.x}
        y1={top + box * 0.27}
        x2={nose.x}
        y2={(leftShoulder.y + rightShoulder.y) / 2}
        stroke={theme.ghost}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d={`M ${leftShoulder.x} ${leftShoulder.y}
            Q ${nose.x} ${leftShoulder.y - box * 0.04} ${rightShoulder.x} ${rightShoulder.y}
            L ${left + box * 0.68} ${top + box * 0.92}
            L ${left + box * 0.32} ${top + box * 0.92} Z`}
        stroke={theme.ghost}
        strokeWidth={2}
        fill="rgba(215,235,227,0.12)"
      />
      {GUIDE_BONES.map(([from, to]) => {
        const start = at(from);
        const end = at(to);
        return (
          <Line
            key={`${from}-${to}-guide`}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke={theme.ghost}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        );
      })}
      {Object.entries(SILHOUETTE).map(([name, point]) => (
        <Circle
          key={name}
          cx={left + point[0] * box}
          cy={top + point[1] * box}
          r={3.5}
          stroke={theme.ghost}
          strokeWidth={1.5}
          fill="none"
        />
      ))}
    </G>
  );
}

function TimerRing({ progress, color }: { progress: number; color: string }) {
  const radius = 8;
  const cx = 11;
  const cy = 11;
  const start = -Math.PI / 2;
  const end = start + Math.min(progress, 0.999) * Math.PI * 2;
  const x1 = cx + radius * Math.cos(start);
  const y1 = cy + radius * Math.sin(start);
  const x2 = cx + radius * Math.cos(end);
  const y2 = cy + radius * Math.sin(end);
  const large = progress > 0.5 ? 1 : 0;
  const arc =
    progress <= 0
      ? ""
      : `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  return (
    <Svg width={22} height={22}>
      <Circle
        cx={cx}
        cy={cy}
        r={radius}
        stroke="#E4DFD6"
        strokeWidth={2.4}
        fill="none"
      />
      {arc ? (
        <Path
          d={arc}
          stroke={color}
          strokeWidth={2.4}
          fill="none"
          strokeLinecap="round"
        />
      ) : null}
    </Svg>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFill,
  },
  topRow: {
    position: "absolute",
    top: 12,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  cameraPill: {
    backgroundColor: "rgba(28, 36, 32, 0.72)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cameraPillText: {
    color: theme.white,
    fontFamily: font.sansMedium,
    fontSize: 13,
  },
  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.bg,
    borderRadius: 18,
    paddingLeft: 6,
    paddingRight: 12,
    paddingVertical: 5,
  },
  timerValue: {
    color: theme.ink,
    fontFamily: font.sansSemi,
    fontSize: 14,
  },
  timerTotal: {
    color: theme.muted,
    fontFamily: font.sans,
    fontSize: 13,
  },
  tag: {
    position: "absolute",
    top: 52,
    left: 16,
    backgroundColor: "rgba(28, 36, 32, 0.55)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    color: theme.white,
    fontFamily: font.sans,
    fontSize: 12,
  },
  missing: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 28,
  },
  missingTitle: {
    color: theme.white,
    fontFamily: font.sansSemi,
    fontSize: 16,
    lineHeight: 21,
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  missingBody: {
    marginTop: 4,
    color: "rgba(255,255,255,0.88)",
    fontFamily: font.sans,
    fontSize: 13,
    lineHeight: 18,
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
