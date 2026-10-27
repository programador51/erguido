import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PoseOverlay } from "../components/PoseOverlay";
import { ReviewSheet } from "../components/ReviewSheet";
import { PoseCamera } from "../pose/PoseCamera";
import {
  SESSION_MS,
  PostureTracker,
  canonicalName,
  type Joint,
  type Reading,
} from "../posture";
import { theme } from "../theme";

const EMPTY: Reading = {
  detected: false,
  head: false,
  shoulders: false,
  keypoints: [],
};

function smoothJoints(memory: Map<string, Joint>, joints: Joint[]): Joint[] {
  const seen = new Set<string>();
  const next = joints.map((joint) => {
    const name = canonicalName(joint.name);
    seen.add(name);
    const previous = memory.get(name);
    const blended: Joint = previous
      ? {
          ...joint,
          name,
          x: previous.x + (joint.x - previous.x) * 0.5,
          y: previous.y + (joint.y - previous.y) * 0.5,
        }
      : { ...joint, name };
    memory.set(name, blended);
    return blended;
  });
  for (const name of memory.keys()) {
    if (!seen.has(name)) memory.delete(name);
  }
  return next;
}

export function ReviewScreen({ onFinish }: { onFinish: () => void }) {
  const insets = useSafeAreaInsets();
  const tracker = useRef(new PostureTracker());
  const smooth = useRef(new Map<string, Joint>());
  const lastPush = useRef(0);
  const finished = useRef(false);
  const aspect = useRef(0);
  const [reading, setReading] = useState<Reading>(EMPTY);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [ready, setReady] = useState(false);
  const [frame, setFrame] = useState({ width: 0, height: 0 });

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    if (!ready) return;
    const started = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - started;
      if (elapsed >= SESSION_MS) {
        setElapsedMs(SESSION_MS);
        finish();
      } else {
        setElapsedMs(elapsed);
      }
    }, 200);
    return () => clearInterval(id);
  }, [ready, finish]);

  const onFrame = useCallback((joints: Joint[]) => {
    const now = Date.now();
    if (now - lastPush.current < 50) return;
    lastPush.current = now;
    if (aspect.current <= 0) return;
    const next = tracker.current.push(
      smoothJoints(smooth.current, joints),
      now,
      aspect.current,
    );
    if (!next.detected) smooth.current.clear();
    setReading(next);
  }, []);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View
        style={styles.camera}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          aspect.current = width > 0 ? height / width : 0;
          setFrame({ width, height });
        }}
      >
        <PoseCamera onFrame={onFrame} onReady={() => setReady(true)} />
        <PoseOverlay
          width={frame.width}
          height={frame.height}
          reading={reading}
          elapsedMs={elapsedMs}
          ready={ready}
        />
      </View>
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <ReviewSheet reading={ready ? reading : EMPTY} ready={ready} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.camera,
  },
  camera: {
    flex: 1,
    minHeight: 0,
    backgroundColor: theme.camera,
  },
  sheet: {
    flexShrink: 0,
    marginTop: -24,
    backgroundColor: theme.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    zIndex: 2,
  },
});
