import assert from "node:assert/strict";
import { test } from "node:test";
import { createCameraController } from "../app/camera.mjs";

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function stream() {
  const track = { stopped: false, stop() { this.stopped = true; } };
  return { track, getTracks: () => [track] };
}
function video(play = async () => {}) { return { srcObject: null, play }; }

test("a late camera request is stopped without replacing the newer stream", async () => {
  const controller = createCameraController();
  const pending = deferred();
  const target = video();
  const first = controller.start(() => pending.promise, () => target);
  const newer = stream();
  assert.equal((await controller.start(async () => newer, () => target)).status, "started");
  const older = stream();
  pending.resolve(older);
  assert.equal((await first).status, "stale");
  assert.equal(older.track.stopped, true);
  assert.equal(newer.track.stopped, false);
  assert.equal(target.srcObject, newer);
  controller.stop();
  assert.equal(newer.track.stopped, true);
  assert.equal(target.srcObject, null);
});

test("stopping while permission is pending releases a late stream", async () => {
  const controller = createCameraController();
  const pending = deferred();
  const operation = controller.start(() => pending.promise, () => video());
  controller.stop();
  const late = stream();
  pending.resolve(late);
  assert.equal((await operation).status, "stale");
  assert.equal(late.track.stopped, true);
});

test("a playback failure releases the acquired stream and clears the video", async () => {
  const controller = createCameraController();
  const acquired = stream();
  const target = video(async () => { throw new Error("playback failed"); });
  assert.equal((await controller.start(async () => acquired, () => target)).status, "failed");
  assert.equal(acquired.track.stopped, true);
  assert.equal(target.srcObject, null);
});

test("a stale playback rejection cannot stop a replacement stream", async () => {
  const controller = createCameraController();
  const playback = deferred();
  const target = video(() => playback.promise);
  const firstStream = stream();
  const first = controller.start(async () => firstStream, () => target);
  await Promise.resolve();
  target.play = async () => {};
  const newer = stream();
  assert.equal((await controller.start(async () => newer, () => target)).status, "started");
  playback.reject(new Error("interrupted"));
  assert.equal((await first).status, "stale");
  assert.equal(firstStream.track.stopped, true);
  assert.equal(newer.track.stopped, false);
  assert.equal(target.srcObject, newer);
  controller.stop();
});
