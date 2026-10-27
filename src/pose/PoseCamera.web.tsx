import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import type { Joint } from "../posture";
import type { PoseCameraProps } from "./types";

type PoseKeypoint = {
  name?: string;
  x?: number;
  y?: number;
  score?: number;
};

type PoseDetector = {
  estimatePoses: (
    video: HTMLVideoElement,
    config: { flipHorizontal: boolean; maxPoses: number },
  ) => Promise<{ keypoints?: PoseKeypoint[] }[]>;
  dispose: () => void;
};

function coverPoint(
  x: number,
  y: number,
  videoWidth: number,
  videoHeight: number,
  viewWidth: number,
  viewHeight: number,
): { x: number; y: number } {
  const scale = Math.max(viewWidth / videoWidth, viewHeight / videoHeight);
  const offsetX = (videoWidth * scale - viewWidth) / 2;
  const offsetY = (videoHeight * scale - viewHeight) / 2;
  return {
    x: (x * scale - offsetX) / viewWidth,
    y: (y * scale - offsetY) / viewHeight,
  };
}

export function PoseCamera({ onFrame, onReady }: PoseCameraProps) {
  const hostRef = useRef<HTMLElement | null>(null);
  const onFrameRef = useRef(onFrame);
  const onReadyRef = useRef(onReady);
  onFrameRef.current = onFrame;
  onReadyRef.current = onReady;

  useEffect(() => {
    const node = hostRef.current as unknown as HTMLElement | null;
    if (!node || typeof document === "undefined") return;

    let stopped = false;
    let readySent = false;
    let detector: PoseDetector | null = null;
    let stream: MediaStream | null = null;
    let raf = 0;
    const video = document.createElement("video");
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    Object.assign(video.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transform: "scaleX(-1)",
      background: "#1A2420",
    });
    node.appendChild(video);

    const markReady = () => {
      if (readySent || stopped) return;
      readySent = true;
      onReadyRef.current();
    };

    const stop = () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((track) => track.stop());
      stream = null;
      video.srcObject = null;
      video.remove();
      detector?.dispose();
      detector = null;
    };

    const start = async () => {
      try {
        const tf = await import("@tensorflow/tfjs");
        const poseDetection = await import("@tensorflow-models/pose-detection");
        await tf.ready();
        if (stopped) return;
        detector = (await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          },
        )) as PoseDetector;
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: "user" },
        });
        if (stopped) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        video.srcObject = stream;
        await video.play();

        let busy = false;
        let last = 0;
        const tick = async (time: number) => {
          if (stopped) return;
          if (
            !busy &&
            time - last > 80 &&
            detector &&
            video.readyState >= 2 &&
            video.videoWidth > 0
          ) {
            last = time;
            busy = true;
            try {
              const poses = await detector.estimatePoses(video, {
                flipHorizontal: true,
                maxPoses: 1,
              });
              const viewWidth = node.clientWidth || 1;
              const viewHeight = node.clientHeight || 1;
              const joints: Joint[] = (poses[0]?.keypoints ?? []).map((point) => {
                const mapped = coverPoint(
                  point.x ?? 0,
                  point.y ?? 0,
                  video.videoWidth,
                  video.videoHeight,
                  viewWidth,
                  viewHeight,
                );
                return {
                  name: point.name ?? "",
                  x: mapped.x,
                  y: mapped.y,
                  score: point.score ?? 0,
                };
              });
              if (!stopped) {
                onFrameRef.current(joints);
                markReady();
              }
            } catch {
              // A single frame can fail while the camera stays open.
            }
            busy = false;
          }
          if (!stopped) raf = requestAnimationFrame((next) => void tick(next));
        };
        raf = requestAnimationFrame((next) => void tick(next));
      } catch {
        video.style.display = "none";
      }
    };

    void start();
    return stop;
  }, []);

  return (
    <View
      ref={(node) => {
        hostRef.current = node as unknown as HTMLElement | null;
      }}
      style={styles.fill}
    />
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
    backgroundColor: "#1A2420",
  },
});
