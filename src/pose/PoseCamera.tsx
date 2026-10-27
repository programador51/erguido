import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import {
  PoseTrackerProvider,
  usePoseTracker,
  WebViewPoseView,
} from "@pose-tracker/react-native-pose-estimation";
import type { Joint } from "../posture";
import type { PoseCameraProps } from "./types";

function LiveCamera({ onFrame, onReady }: PoseCameraProps) {
  const onFrameRef = useRef(onFrame);
  const onReadyRef = useRef(onReady);
  const cameraReady = useRef(false);
  const sawFrame = useRef(false);
  onFrameRef.current = onFrame;
  onReadyRef.current = onReady;

  const publishReady = () => {
    if (cameraReady.current && sawFrame.current) onReadyRef.current();
  };

  usePoseTracker({
    onKeypoints: (event) => {
      const joints: Joint[] = event.keypoints.map((point) => ({
        name: point.name,
        x: point.x,
        y: point.y,
        score: point.score,
      }));
      sawFrame.current = true;
      onFrameRef.current(joints);
      publishReady();
    },
    onInitialization: (event) => {
      if (!event.ready) return;
      cameraReady.current = true;
      publishReady();
    },
  });

  return (
    <WebViewPoseView
      style={StyleSheet.absoluteFill}
      position="front"
      drawSkeleton={false}
      drawPlacementBox={false}
      loadingText="Preparando la guía"
    />
  );
}

export function PoseCamera(props: PoseCameraProps) {
  return (
    <View style={styles.fill} collapsable={false}>
      <PoseTrackerProvider>
        <LiveCamera {...props} />
      </PoseTrackerProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFill,
  },
});
