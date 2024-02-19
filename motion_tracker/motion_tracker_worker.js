/*
 * Copyright (C) 2020 Garrett Brown
 * This file is part of trajectory-reconstruction - https://github.com/eigendude/trajectory-reconstruction
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

// Assuming motion_tracker.js is generated with EXPORT_ES6 and MODULARIZE
import ModuleFactory from "./motion_tracker.js";

let Module;
let motionTracker;

async function initializeMotionTracker() {
  try {
    Module = await ModuleFactory();

    motionTracker = new Module.MotionTracker();

    // Signal that the module and motionTracker are initialized
    postMessage({
      type: "moduleInitialized",
    });
  } catch (error) {
    console.error("Failed to initialize the motion tracker module:", error);
    // Handle initialization failure
    postMessage({
      type: "initializationFailed",
      error: error.message,
    });
  }
}

// Start the initialization process
initializeMotionTracker();

self.onmessage = (event) => {
  let msg = event.data;

  switch (msg.type) {
    case "open":
      const { videoWidth, videoHeight } = msg;
      open(videoWidth, videoHeight);
      break;

    case "addVideoFrame":
      const { pts, pixelBuffer, byteOffset, byteLength } = msg;

      const pixelData = new Uint8ClampedArray(
        pixelBuffer,
        byteOffset,
        byteLength
      );

      addVideoFrame(pts, pixelData);
      break;

    case "close":
      close();
      break;

    default:
      console.error(`Unknown message type: ${msg.type}`);
  }
};

function open(videoWidth, videoHeight) {
  if (!motionTracker) {
    postMessage({ error: "open: Motion tracker is not initialized" });
    return;
  }

  if (!motionTracker.initialize(videoWidth, videoHeight)) {
    postMessage({ error: "Failed to open motion tracker" });
  }
}

function addVideoFrame(pts, pixelData) {
  if (!motionTracker) {
    postMessage({ error: "addVideoFrame: Motion tracker is not initialized" });
    return;
  }

  const frameInfo = motionTracker.addVideoFrame(pixelData);

  const sceneScore = frameInfo.sceneScore;
  const pointData = frameInfo.pointData;
  const pointSize = frameInfo.pointSize;
  const initialPointData = frameInfo.initialPointData;
  const initialPointSize = frameInfo.initialPointSize;
  const projectionMatrixData = frameInfo.projectionMatrixData;
  const projectionMatrixSize = frameInfo.projectionMatrixSize;

  // Get reference to WASM memory
  const points = new Float32Array(Module.HEAPU8.buffer, pointData, pointSize);
  const initialPoints = new Float32Array(
    Module.HEAPU8.buffer,
    initialPointData,
    initialPointSize
  );

  // Allocate new data
  const pointBuffer = new ArrayBuffer(pointSize);
  const initialPointBuffer = new ArrayBuffer(initialPointSize);

  const pointDest = new Float32Array(pointSize);
  const initialPointDest = new Float32Array(initialPointSize);

  // Copy data
  pointDest.set(points);
  initialPointDest.set(initialPoints);

  // TODO: projection matrix
  postMessage(
    {
      type: "onFrameProcessed",
      pts: pts,
      sceneScore: sceneScore,
      pointBuffer: pointDest.buffer,
      pointOffset: pointDest.byteOffset,
      pointLength: pointDest.byteLength / Float32Array.BYTES_PER_ELEMENT,
      initialPointBuffer: initialPointDest.buffer,
      initialPointOffset: initialPointDest.byteOffset,
      initialPointLength:
        initialPointDest.byteLength / Float32Array.BYTES_PER_ELEMENT,
      //projectionMatrixBuffer: null,
    },
    [pointDest.buffer, initialPointDest.buffer]
  );
}

function close() {
  if (!motionTracker) {
    postMessage({ error: "close: Motion tracker is not initialized" });
    return;
  }

  motionTracker.deinitialize();
}
