import Hls from "../_snowpack/pkg/hlsjs.js";
import {IPFS_GATEWAY} from "./ipfs.js";
import {MotionTracker} from "./motiontracker.js";
import {World} from "./world.js";
const world = new World();
console.log("-------------------------------------");
console.log(`${document.title}`);
console.log(`Gateway: ${IPFS_GATEWAY}`);
console.log(`World version: ${world.version}`);
console.log(`World: ${world.cid}`);
console.log("-------------------------------------");
const HLS_BUFFER_LENGTH = 60 * 60;
const HLS_BUFFER_SIZE = 1 * 1024 * 1024 * 1024;
async function loadUserInterface(node) {
  log_ui(`  HLS support: ${Hls.isSupported()}`);
  if (!Hls.isSupported()) {
    log_ui("HLS support is required");
    return;
  }
  const videoUri = await world.getVideoHlsUri();
  await loadHls(videoUri);
}
async function loadHls(videoUri) {
  const hls = new Hls({
    maxBufferLength: HLS_BUFFER_LENGTH,
    maxBufferSize: HLS_BUFFER_SIZE,
    maxMaxBufferSize: HLS_BUFFER_SIZE
  });
  hls.loadSource(videoUri);
  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    log_ui(`Parsed HLS manifest`);
    const video = document.getElementById("videoBackground");
    hls.attachMedia(video);
    const volumeIcon = video.muted ? document.getElementById("volumeMuteIcon") : document.getElementById("volumeUpIcon");
    volumeIcon.style.display = "block";
    motionTracker.start(video);
  });
}
const motionTracker = new MotionTracker(window);
function onVolumeSelect() {
  const video = document.getElementById("videoBackground");
  const volumeMuteIcon2 = document.getElementById("volumeMuteIcon");
  const volumeUpIcon2 = document.getElementById("volumeUpIcon");
  if (video.muted) {
    video.muted = false;
    volumeMuteIcon2.style.display = "none";
    volumeUpIcon2.style.display = "block";
  } else {
    video.muted = true;
    volumeUpIcon2.style.display = "none";
    volumeMuteIcon2.style.display = "block";
  }
}
function enterFullscreen() {
  const canvas = document.getElementById("renderCanvas");
  if (canvas.requestFullscreen) {
    canvas.requestFullscreen();
  } else if (canvas.webkitRequestFullscreen) {
    canvas.webkitRequestFullscreen();
  } else if (canvas.mozRequestFullScreen) {
    canvas.mozRequestFullScreen();
  } else if (canvas.msRequestFullscreen) {
    canvas.msRequestFullscreen();
  }
}
function leaveFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}
function onFullscreenSelect() {
  const inFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
  if (inFullscreen) {
    enterFullscreenIcon.style.display = "none";
    leaveFullscreenIcon.style.display = "block";
  } else {
    enterFullscreenIcon.style.display = "block";
    leaveFullscreenIcon.style.display = "none";
  }
}
function fullscreenAvailable() {
  const fullscreenAvailable2 = document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled;
  return fullscreenAvailable2;
}
window.showOverlay = false;
function toggleOverlay() {
  const viewOverlayIcon2 = document.getElementById("viewOverlayIcon");
  const hideOverlayIcon2 = document.getElementById("hideOverlayIcon");
  const overlayCanvas2D = document.getElementById("overlayCanvas2D");
  const overlayCanvas3D = document.getElementById("overlayCanvas3D");
  if (window.showOverlay) {
    window.showOverlay = false;
    viewOverlayIcon2.style.display = "block";
    hideOverlayIcon2.style.display = "none";
    overlayCanvas2D.style.display = "none";
    overlayCanvas3D.style.display = "none";
  } else {
    window.showOverlay = true;
    viewOverlayIcon2.style.display = "none";
    hideOverlayIcon2.style.display = "block";
    overlayCanvas2D.style.display = "block";
    overlayCanvas3D.style.display = "block";
  }
}
function log_ui(message) {
  console.log(`[UI    ] ${message}`);
}
const volumeDownIcon = document.getElementById("volumeDownIcon");
const volumeMuteIcon = document.getElementById("volumeMuteIcon");
const volumeOffIcon = document.getElementById("volumeOffIcon");
const volumeUpIcon = document.getElementById("volumeUpIcon");
volumeDownIcon.onclick = volumeMuteIcon.onclick = volumeOffIcon.onclick = volumeUpIcon.onclick = onVolumeSelect;
if (fullscreenAvailable()) {
  const enterFullscreenIcon2 = document.getElementById("enterFullscreenIcon");
  const leaveFullscreenIcon2 = document.getElementById("leaveFullscreenIcon");
  enterFullscreenIcon2.onclick = enterFullscreen;
  leaveFullscreenIcon2.onclick = leaveFullscreen;
  document.addEventListener("fullscreenchange", onFullscreenSelect);
  onFullscreenSelect();
}
const viewOverlayIcon = document.getElementById("viewOverlayIcon");
const hideOverlayIcon = document.getElementById("hideOverlayIcon");
viewOverlayIcon.onclick = hideOverlayIcon.onclick = toggleOverlay;
loadUserInterface(null);
