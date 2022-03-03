import * as THREE from "../_snowpack/pkg/three.js";
const WORKER_PATH = "./motion_tracker/motion_tracker_worker.js";
const MAX_RENDER_SIZE = 512;
let resolveFrameProcessed;
class MotionTracker {
  constructor(window) {
    this.window = window;
    this.video = null;
    this.motionWorker = new Worker(WORKER_PATH);
    this.motionWorkerInitialized = false;
    this.motionWorkerOpen = false;
    this.renderCanvas = document.getElementById("renderCanvas");
    this.overlayCanvas2D = document.getElementById("overlayCanvas2D");
    this.overlayCanvas3D = document.getElementById("overlayCanvas3D");
    this.renderContext = this.renderCanvas.getContext("2d");
    this.overlayContext = this.overlayCanvas2D.getContext("2d");
    this.initialPoints = null;
    this.scene = new THREE.Scene();
    this.camera = null;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.overlayCanvas3D,
      alpha: true
    });
    const radius = 1;
    const widthSegments = 8;
    const heightSegments = 8;
    this.geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
    this.wireframe = new THREE.WireframeGeometry(this.geometry);
    this.line = new THREE.LineSegments(this.wireframe);
    this.line.position.z = -10;
    this.line.material.depthTest = false;
    this.line.material.opacity = 0.25;
    this.line.material.transparent = true;
    let self = this;
    this.motionWorker.onmessage = function(event) {
      const msg = event.data;
      if (msg.error) {
        throw new Error(msg.error);
      }
      switch (msg.type) {
        case "moduleInitialized":
          console.log("Motion tracker worker initialized");
          self.motionWorkerInitialized = true;
          break;
        case "onFrameProcessed":
          const frameInfo = {
            pts: msg.pts,
            sceneScore: msg.sceneScore,
            pointBuffer: msg.pointBuffer,
            pointOffset: msg.pointOffset,
            pointLength: msg.pointLength,
            initialPointBuffer: msg.initialPointBuffer,
            initialPointOffset: msg.initialPointOffset,
            initialPointLength: msg.initialPointLength
          };
          resolveFrameProcessed(frameInfo);
          break;
        default:
          console.error("Unkown message type: " + msg.type);
      }
    };
  }
  start(video) {
    this.video = video;
    let self = this;
    this.window.addEventListener("resize", () => {
      this.computeDimensions();
    });
    this.window.addEventListener("orientationchange", () => {
      this.computeDimensions();
    });
    this.video.addEventListener("loadedmetadata", function() {
      self.computeDimensions();
    });
    this.video.addEventListener("play", async function() {
      self.computeDimensions();
      const viewOverlayIcon = document.getElementById("viewOverlayIcon");
      const hideOverlayIcon = document.getElementById("hideOverlayIcon");
      if (self.window.showOverlay) {
        viewOverlayIcon.style.display = "none";
        hideOverlayIcon.style.display = "block";
        self.overlayCanvas2D.style.display = "block";
        self.overlayCanvas3D.style.display = "block";
      } else {
        viewOverlayIcon.style.display = "block";
        hideOverlayIcon.style.display = "none";
        self.overlayCanvas2D.style.display = "none";
        self.overlayCanvas3D.style.display = "none";
      }
      function animate() {
        requestAnimationFrame(animate);
        self.renderer.render(self.scene, self.camera);
      }
      animate();
      await self.renderLoop();
    }, false);
  }
  doUnload() {
  }
  async renderLoop() {
    if (this.video.paused || this.video.ended) {
      return;
    }
    await this.renderFrame();
    let self = this;
    setTimeout(async function() {
      await self.renderLoop();
    }, 0);
  }
  computeDimensions() {
    const videoWidth = this.video.videoWidth;
    const videoHeight = this.video.videoHeight;
    const displayWidth = this.video.clientWidth;
    const displayHeight = this.video.clientHeight;
    if (videoWidth == 0 || videoHeight == 0 || displayWidth == 0 || displayHeight == 0) {
      return false;
    }
    let renderWidth = videoWidth;
    let renderHeight = videoHeight;
    while (Math.max(renderWidth, renderHeight) > MAX_RENDER_SIZE) {
      renderWidth /= 2;
      renderHeight /= 2;
    }
    if (this.renderCanvas.width != renderWidth || this.renderCanvas.height != renderHeight) {
      this.renderCanvas.width = renderWidth;
      this.renderCanvas.height = renderHeight;
    }
    if (this.overlayCanvas2D.width != displayWidth || this.overlayCanvas2D.height != displayHeight) {
      this.overlayCanvas2D.width = displayWidth;
      this.overlayCanvas2D.height = displayHeight;
      const fov = 75;
      const aspect = displayWidth / displayHeight;
      const near = 0.1;
      const far = 1e3;
      this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      this.camera.position.x = 0;
      this.camera.position.y = 0;
      this.camera.position.z = 0;
      this.camera.rotation.x = 0;
      this.camera.rotation.y = 0;
      this.camera.rotation.z = 0;
      this.renderer.setSize(displayWidth, displayHeight);
    }
    return true;
  }
  async renderFrame() {
    if (!this.motionWorkerInitialized) {
      return;
    }
    if (!this.computeDimensions()) {
      return;
    }
    if (!this.window.showOverlay) {
      return;
    }
    const renderWidth = this.renderCanvas.width;
    const renderHeight = this.renderCanvas.height;
    if (!this.motionWorkerOpen) {
      this.motionWorker.postMessage({
        type: "open",
        videoWidth: renderWidth,
        videoHeight: renderHeight
      });
      this.motionWorkerOpen = true;
    }
    const {renderPixels, pts} = this.renderVideo(this.video, renderWidth, renderHeight);
    if (!renderPixels) {
      return;
    }
    this.frameProcessed = new Promise((resolve, reject) => {
      resolveFrameProcessed = resolve;
    });
    this.motionWorker.postMessage({
      type: "addVideoFrame",
      pts,
      pixelBuffer: renderPixels.data.buffer,
      byteOffset: renderPixels.data.byteOffset,
      byteLength: renderPixels.data.byteLength
    }, [renderPixels.data.buffer]);
    const frameInfo = await this.frameProcessed;
    const nowMs = performance.now();
    const sceneScore = frameInfo.sceneScore;
    const pointBuffer = frameInfo.pointBuffer;
    const pointOffset = frameInfo.pointOffset;
    const pointLength = frameInfo.pointLength;
    const initialPointBuffer = frameInfo.initialPointBuffer;
    const initialPointOffset = frameInfo.initialPointOffset;
    const initialPointLength = frameInfo.initialPointLength;
    const points = new Float32Array(pointBuffer, pointOffset, pointLength);
    const initialPoints = new Float32Array(initialPointBuffer, initialPointOffset, initialPointLength);
    let pointCount = `${points.length / 2}`;
    while (pointCount.length < 4) {
      pointCount = " " + pointCount;
    }
    this.computeDimensions();
    const overlayWidth = this.overlayCanvas2D.width;
    const overlayHeight = this.overlayCanvas2D.height;
    this.overlayContext.clearRect(0, 0, overlayWidth, overlayHeight);
    for (let i = 0; i < points.length; i += 2) {
      const x = points[i];
      const y = points[i + 1];
      const initialX = initialPoints[i];
      const initialY = initialPoints[i + 1];
      const coords = this.getCoordinates(renderWidth, renderHeight, overlayWidth, overlayHeight, x, y);
      const initialCoords = this.getCoordinates(renderWidth, renderHeight, overlayWidth, overlayHeight, initialX, initialY);
      if (0 <= coords.x && coords.x <= overlayWidth && 0 <= coords.y && coords.y <= overlayHeight) {
        this.drawCircle(coords.x, coords.y);
        if (0 <= initialCoords.x && initialCoords.x <= overlayWidth && 0 <= initialCoords.y && initialCoords.y <= overlayHeight) {
          this.drawLine(initialCoords.x, initialCoords.y, coords.x, coords.y);
        }
      }
    }
  }
  renderVideo(video, renderWidth, renderHeight) {
    this.renderContext.drawImage(video, 0, 0, renderWidth, renderHeight);
    const renderPixels = this.renderContext.getImageData(0, 0, renderWidth, renderHeight);
    const pts = performance.now();
    return {renderPixels, pts};
  }
  getCoordinates(renderWidth, renderHeight, overlayWidth, overlayHeight, x, y) {
    const videoAspect = renderWidth / renderHeight;
    const displayAspect = overlayWidth / overlayHeight;
    let scaleFactor = 1;
    let cropX = 0;
    let cropY = 0;
    if (displayAspect < videoAspect) {
      scaleFactor = overlayHeight / renderHeight;
      cropX = (renderWidth * scaleFactor - overlayWidth) / 2;
    } else {
      scaleFactor = overlayWidth / renderWidth;
      cropY = (renderHeight * scaleFactor - overlayHeight) / 2;
    }
    x *= scaleFactor;
    y *= scaleFactor;
    x -= cropX;
    y -= cropY;
    return {x, y};
  }
  drawCircle(x, y) {
    this.overlayContext.beginPath();
    this.overlayContext.arc(x, y, 4, 0, 2 * Math.PI, false);
    this.overlayContext.fillStyle = "white";
    this.overlayContext.fill();
    this.overlayContext.lineWidth = 2;
    this.overlayContext.strokeStyle = "#333333";
    this.overlayContext.stroke();
  }
  drawLine(x1, y1, x2, y2) {
    this.overlayContext.beginPath();
    this.overlayContext.moveTo(x1, y1);
    this.overlayContext.lineTo(x2, y2);
    this.overlayContext.lineWidth = 1;
    this.overlayContext.strokeStyle = "rgba(255, 255, 255, 0.65)";
    this.overlayContext.stroke();
  }
}
export {MotionTracker};
