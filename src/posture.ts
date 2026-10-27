export const SESSION_MS = 20_000;
export const MIN_SCORE = 0.3;

/**
 * Distances are in units of image width. Pass the view's height/width as
 * `aspect`, because keypoint x and y are each normalized to their own side.
 *
 * A seated front camera makes the shoulders look wide, so a neck measured in
 * shoulder-widths stays short even when the crown is up. The head is compared
 * with the head's own width. Raised shoulders are the shoulders moving up
 * toward the ears, including when the elbows rise with them.
 */
const HEAD_RATIO_FORWARD = 0.62;
const HEAD_RATIO_CLEAR = 0.56;
const HEAD_RATIO_SHRUG = 0.52;
const NOSE_DROP_HEAD = 0.7;
const NOSE_DROP_CLEAR = 0.45;
const NECK_HEAD = 0.88;
const NECK_HEAD_CLEAR = 1.08;
const NECK_SHOULDER = 0.72;
const NECK_SHOULDER_CLEAR = 0.9;
const NECK_VERY_HIGH = 0.58;
const ARM_SHOULDER = 0.64;
const ARM_SHOULDER_CLEAR = 0.54;

const DETECT_HOLD_MS = 180;
const LOST_HOLD_MS = 450;
const MIN_SHOULDER_WIDTH = 0.08;

export type Joint = {
  name: string;
  x: number;
  y: number;
  score: number;
};

export type Reading = {
  detected: boolean;
  head: boolean;
  shoulders: boolean;
  keypoints: Joint[];
};

export type PoseMeasure = {
  detected: boolean;
  /** Ear-to-shoulder distance, in head-widths. Short when the crown drops or the shoulders rise. */
  neck: number | null;
  /** Nose below the ears, in head-widths. */
  noseDrop: number | null;
  /** Elbows below the shoulders, in shoulder-widths. */
  arm: number | null;
  /** Head width divided by shoulder width. Grows when the head comes closer. */
  headRatio: number | null;
};

export type CueFlags = {
  head: boolean;
  shoulders: boolean;
};

export const GUIDE_BONES = [
  ["nose", "left_eye", "head"],
  ["nose", "right_eye", "head"],
  ["left_eye", "left_ear", "head"],
  ["right_eye", "right_ear", "head"],
  ["left_shoulder", "right_shoulder", "shoulders"],
  ["left_shoulder", "left_elbow", "arms"],
  ["right_shoulder", "right_elbow", "arms"],
] as const;

export type BoneGroup = (typeof GUIDE_BONES)[number][2];

export function canonicalName(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
}

function findJoint(joints: Joint[], name: string): Joint | undefined {
  return joints.find(
    (joint) => canonicalName(joint.name) === name && joint.score >= MIN_SCORE,
  );
}

function emptyMeasure(): PoseMeasure {
  return {
    detected: false,
    neck: null,
    noseDrop: null,
    arm: null,
    headRatio: null,
  };
}

/**
 * Front-camera MoveNet has no depth. `aspect` is the view height divided by
 * its width, so a vertical step matches a horizontal one.
 */
export function measurePose(joints: Joint[], aspect = 1): PoseMeasure {
  const nose = findJoint(joints, "nose");
  const leftShoulder = findJoint(joints, "left_shoulder");
  const rightShoulder = findJoint(joints, "right_shoulder");
  if (!nose || !leftShoulder || !rightShoulder) return emptyMeasure();

  const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
  if (shoulderWidth < MIN_SHOULDER_WIDTH) return emptyMeasure();

  const yOf = (joint: Joint) => joint.y * aspect;
  const shoulderY = (yOf(leftShoulder) + yOf(rightShoulder)) / 2;
  const leftEar = findJoint(joints, "left_ear");
  const rightEar = findJoint(joints, "right_ear");
  const leftEye = findJoint(joints, "left_eye");
  const rightEye = findJoint(joints, "right_eye");
  const leftElbow = findJoint(joints, "left_elbow");
  const rightElbow = findJoint(joints, "right_elbow");

  let headWidth: number | null = null;
  let crownY: number | null = null;
  if (leftEar && rightEar) {
    headWidth = Math.abs(rightEar.x - leftEar.x);
    crownY = (yOf(leftEar) + yOf(rightEar)) / 2;
  } else if (leftEye && rightEye) {
    headWidth = Math.abs(rightEye.x - leftEye.x) * 2.1;
    crownY = (yOf(leftEye) + yOf(rightEye)) / 2;
  }

  let neck: number | null = null;
  let noseDrop: number | null = null;
  let headRatio: number | null = null;
  if (headWidth != null && headWidth > 0.04 && crownY != null) {
    neck = (shoulderY - crownY) / headWidth;
    noseDrop = (yOf(nose) - crownY) / headWidth;
    headRatio = headWidth / shoulderWidth;
  }

  let arm: number | null = null;
  if (leftElbow && rightElbow) {
    const elbowY = (yOf(leftElbow) + yOf(rightElbow)) / 2;
    arm = (elbowY - shoulderY) / shoulderWidth;
  }

  return { detected: true, neck, noseDrop, arm, headRatio };
}

function headTriggered(measure: PoseMeasure): boolean {
  const headClose =
    measure.headRatio != null && measure.headRatio > HEAD_RATIO_FORWARD;
  const noseLow =
    measure.noseDrop != null && measure.noseDrop > NOSE_DROP_HEAD;
  const shortNeck =
    measure.neck != null &&
    measure.neck < NECK_HEAD &&
    (measure.headRatio == null || measure.headRatio >= HEAD_RATIO_SHRUG);
  return headClose || noseLow || shortNeck;
}

function headCleared(measure: PoseMeasure): boolean {
  if (
    measure.neck == null &&
    measure.noseDrop == null &&
    measure.headRatio == null
  ) {
    return false;
  }
  const ratioOk =
    measure.headRatio == null || measure.headRatio < HEAD_RATIO_CLEAR;
  const noseOk =
    measure.noseDrop == null || measure.noseDrop < NOSE_DROP_CLEAR;
  const neckOk = measure.neck == null || measure.neck > NECK_HEAD_CLEAR;
  return ratioOk && noseOk && neckOk;
}

function shouldersTriggered(measure: PoseMeasure): boolean {
  const elbowsStayed = measure.arm != null && measure.arm > ARM_SHOULDER;
  const raisedTowardHead =
    measure.neck != null &&
    measure.neck < NECK_SHOULDER &&
    (measure.headRatio == null || measure.headRatio < HEAD_RATIO_SHRUG);
  const shouldersAtEars =
    measure.neck != null && measure.neck < NECK_VERY_HIGH;
  return elbowsStayed || raisedTowardHead || shouldersAtEars;
}

function shouldersCleared(measure: PoseMeasure): boolean {
  if (measure.arm == null && measure.neck == null) return false;
  const armsDown = measure.arm == null || measure.arm < ARM_SHOULDER_CLEAR;
  const shouldersLow =
    measure.neck == null || measure.neck > NECK_SHOULDER_CLEAR;
  return armsDown && shouldersLow;
}

export function applyCueHysteresis(
  measure: PoseMeasure,
  previous: CueFlags,
): CueFlags {
  return {
    head: previous.head ? !headCleared(measure) : headTriggered(measure),
    shoulders: previous.shoulders
      ? !shouldersCleared(measure)
      : shouldersTriggered(measure),
  };
}

export class PostureTracker {
  private started = false;
  private lastAt = 0;
  private presentMs = 0;
  private missingMs = 0;
  private detected = false;
  private cues: CueFlags = { head: false, shoulders: false };

  push(joints: Joint[], now: number, aspect = 1): Reading {
    const dt = this.started
      ? Math.max(0, Math.min(500, now - this.lastAt))
      : 0;
    this.started = true;
    this.lastAt = now;
    const measure = measurePose(joints, aspect);

    if (!measure.detected) {
      this.presentMs = 0;
      this.missingMs += dt;
      if (this.detected && this.missingMs >= LOST_HOLD_MS) {
        this.detected = false;
        this.cues = { head: false, shoulders: false };
      }
    } else {
      this.missingMs = 0;
      this.presentMs += dt;
      if (this.presentMs >= DETECT_HOLD_MS) this.detected = true;
      if (this.detected) this.cues = applyCueHysteresis(measure, this.cues);
    }

    return {
      detected: this.detected,
      head: this.detected && this.cues.head,
      shoulders: this.detected && this.cues.shoulders,
      keypoints: this.detected ? joints : [],
    };
  }
}
