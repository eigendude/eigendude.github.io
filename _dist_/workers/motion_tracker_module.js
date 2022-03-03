import {Observable, Subject} from "../../_snowpack/pkg/threads/observable.js";
import {expose} from "../../_snowpack/pkg/threads/worker.js";
import Module from "../../motion_tracker/motion_tracker.js";
let tracker;
let frameProcessedSubject = new Subject();
let resolveInitialize;
let runtimeInitialized = new Promise((resolve, reject) => {
  resolveInitialize = resolve;
});
Module.onRuntimeInitialized = (_) => {
  resolveInitialize();
};
const motionTracker = {
  async initialize() {
    await runtimeInitialized;
    tracker = new Module.MotionTracker();
  },
  async open(videoWidth, videoHeight) {
    return tracker.initialize(videoWidth, videoHeight);
  },
  async addVideoFrame(pts, pixelBuffer, byteOffset, byteLength) {
    if (!tracker) {
      throw new Error("Motion tracker is not initialized");
    }
    const pixelData = new Uint8ClampedArray(pixelBuffer, byteOffset, byteLength);
    const frameInfo = tracker.addVideoFrame(pixelData);
    const sceneScore = frameInfo.sceneScore;
    const points = frameInfo.points;
    const initialPoints = frameInfo.initialPoints;
    const projectionMatrix = frameInfo.projectionMatrix;
    frameProcessedSubject.next({
      pts,
      sceneScore,
      points,
      initialPoints,
      projectionMatrix
    });
    return true;
  },
  async close() {
    tracker.deinitialize();
  },
  onFrameProcessed() {
    return Observable.from(frameProcessedSubject);
  }
};
expose(motionTracker);
