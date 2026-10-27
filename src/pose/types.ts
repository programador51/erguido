import type { Joint } from "../posture";

export type PoseCameraProps = {
  onFrame: (joints: Joint[]) => void;
  onReady: () => void;
};
