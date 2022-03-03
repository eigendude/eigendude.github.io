import jsonld from "../_snowpack/pkg/jsonld.js";
import {IPFS_GATEWAY} from "./ipfs.js";
class World {
  constructor() {
    this.WORLD_VERSION = "1.0.0";
    this.WORLD_CID = "QmUHi5kmNvVanFJh3EapKHXiDHy8VSi9AatUs6UDkH8odD";
    this.WORLD_URI = `${IPFS_GATEWAY}/ipfs/${this.WORLD_CID}/graph.json`;
  }
  get cid() {
    return this.WORLD_CID;
  }
  get version() {
    return this.WORLD_VERSION;
  }
  async getVideoHlsUri() {
    const response = await fetch(this.WORLD_URI);
    const responseJson = await response.json();
    const context = responseJson;
    const expanded = await jsonld.expand(responseJson);
    const compacted = await jsonld.compact(expanded, context);
    const world = compacted["@graph"];
    const videos = [];
    for (const index in world) {
      const obj = world[index];
      if (obj["@type"] == "VideoObject") {
        videos.push(obj.mediaStream[0].fileUrl);
      }
    }
    const WORLD_VIDEO_INDEX = Math.floor(Math.random() * videos.length);
    const fileName = videos[WORLD_VIDEO_INDEX];
    const videoUri = `${IPFS_GATEWAY}/ipfs/${this.WORLD_CID}/${fileName}`;
    return videoUri;
  }
  async getVideoMp4Uri() {
    const videoHlsUri = await this.getVideoHlsUri();
    return videoHlsUri.replace("/index.m3u8", ".mp4");
  }
}
export {World};
