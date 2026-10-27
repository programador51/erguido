import assert from "node:assert/strict";
import test from "node:test";
import {
  PostureTracker,
  applyCueHysteresis,
  measurePose,
  type Joint,
} from "./posture.ts";

function joint(name: string, x: number, y: number, score = 0.9): Joint {
  return { name, x, y, score };
}

function pose(points: Record<string, [number, number]>): Joint[] {
  return Object.entries(points).map(([name, [x, y]]) => joint(name, x, y));
}

const SEATED = 1.35;

const upright = pose({
  nose: [0.5, 0.22],
  left_eye: [0.46, 0.2],
  right_eye: [0.54, 0.2],
  left_ear: [0.4, 0.21],
  right_ear: [0.6, 0.21],
  left_shoulder: [0.28, 0.42],
  right_shoulder: [0.72, 0.42],
  left_elbow: [0.18, 0.58],
  right_elbow: [0.82, 0.58],
});

test("an upright seated posture does not raise a cue", () => {
  const measure = measurePose(upright, SEATED);
  const cues = applyCueHysteresis(measure, { head: false, shoulders: false });
  assert.equal(measure.detected, true);
  assert.equal(cues.head, false);
  assert.equal(cues.shoulders, false);
});

test("a head that comes forward asks only for the crown", () => {
  const measure = measurePose(
    pose({
      nose: [0.5, 0.34],
      left_ear: [0.38, 0.32],
      right_ear: [0.62, 0.32],
      left_shoulder: [0.28, 0.44],
      right_shoulder: [0.72, 0.44],
      left_elbow: [0.18, 0.6],
      right_elbow: [0.82, 0.6],
    }),
    SEATED,
  );
  const cues = applyCueHysteresis(measure, { head: false, shoulders: false });
  assert.equal(cues.head, true);
  assert.equal(cues.shoulders, false);
});

test("raised shoulders do not also turn on the head cue", () => {
  const measure = measurePose(
    pose({
      nose: [0.5, 0.22],
      left_ear: [0.4, 0.21],
      right_ear: [0.6, 0.21],
      left_shoulder: [0.28, 0.3],
      right_shoulder: [0.72, 0.3],
      left_elbow: [0.18, 0.58],
      right_elbow: [0.82, 0.58],
    }),
    SEATED,
  );
  const cues = applyCueHysteresis(measure, { head: false, shoulders: false });
  assert.equal(cues.head, false);
  assert.equal(cues.shoulders, true);
});

test("shoulders still count when the elbows rise with them", () => {
  const measure = measurePose(
    pose({
      nose: [0.5, 0.22],
      left_ear: [0.4, 0.21],
      right_ear: [0.6, 0.21],
      left_shoulder: [0.28, 0.3],
      right_shoulder: [0.72, 0.3],
      left_elbow: [0.18, 0.46],
      right_elbow: [0.82, 0.46],
    }),
    SEATED,
  );
  const cues = applyCueHysteresis(measure, { head: false, shoulders: false });
  assert.equal(cues.head, false);
  assert.equal(cues.shoulders, true);
});

test("the two cues can be on together", () => {
  const measure = measurePose(
    pose({
      nose: [0.5, 0.36],
      left_ear: [0.37, 0.34],
      right_ear: [0.63, 0.34],
      left_shoulder: [0.28, 0.4],
      right_shoulder: [0.72, 0.4],
      left_elbow: [0.18, 0.62],
      right_elbow: [0.82, 0.62],
    }),
    SEATED,
  );
  const cues = applyCueHysteresis(measure, { head: false, shoulders: false });
  assert.equal(cues.head, true);
  assert.equal(cues.shoulders, true);
});

test("missing nose or shoulders is not a detection", () => {
  assert.equal(
    measurePose(upright.filter((item) => item.name !== "nose")).detected,
    false,
  );
  const faint = upright.map((item) =>
    item.name === "left_shoulder" ? { ...item, score: 0.1 } : item,
  );
  assert.equal(measurePose(faint).detected, false);
});

test("a cue stays until the posture clearly recovers", () => {
  const held = applyCueHysteresis(
    {
      detected: true,
      neck: 0.7,
      noseDrop: 0.5,
      arm: 0.6,
      headRatio: 0.56,
    },
    { head: true, shoulders: true },
  );
  assert.deepEqual(held, { head: true, shoulders: true });

  const cleared = applyCueHysteresis(
    {
      detected: true,
      neck: 1.3,
      noseDrop: 0.2,
      arm: 0.4,
      headRatio: 0.42,
    },
    held,
  );
  assert.deepEqual(cleared, { head: false, shoulders: false });
});

test("the tracker waits before showing or hiding a person", () => {
  const tracker = new PostureTracker();
  assert.equal(tracker.push(upright, 0, SEATED).detected, false);
  const shown = tracker.push(upright, 200, SEATED);
  assert.equal(shown.detected, true);
  assert.equal(shown.head, false);

  assert.equal(tracker.push([], 400).detected, true);
  const lost = tracker.push([], 900);
  assert.equal(lost.detected, false);
  assert.equal(lost.keypoints.length, 0);
});
