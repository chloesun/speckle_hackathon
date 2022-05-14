import ObjectLoader from "./ObjectLoader.js";
import Converter from "./converter/Converter.js";

/**
 * Helper wrapper around the ObjectLoader class, with some built in assumptions.
 */

export default class ViewerObjectLoader {
  constructor(objectUrl, authToken) {
    // this.viewer = parent
    this.token = null;
    try {
      this.token = authToken || localStorage.getItem("AuthToken");
    } catch (error) {
      // Accessing localStorage may throw when executing on sandboxed document, ignore.
    }

    if (!this.token) {
      console.warn(
        "Viewer: no auth token present. Requests to non-public stream objects will fail."
      );
    }

    // example url: `https://staging.speckle.dev/streams/a75ab4f10f/objects/f33645dc9a702de8af0af16bd5f655b0`
    let url = new URL(objectUrl);

    let segments = url.pathname.split("/");
    if (
      segments.length < 5 ||
      url.pathname.indexOf("streams") === -1 ||
      url.pathname.indexOf("objects") === -1
    ) {
      throw new Error("Unexpected object url format.");
    }

    this.serverUrl = url.origin;
    this.streamId = segments[2];
    this.objectId = segments[4];

    this.loader = new ObjectLoader({
      serverUrl: this.serverUrl,
      token: this.token,
      streamId: this.streamId,
      objectId: this.objectId,
    });

    this.converter = new Converter(this.loader);
  }

  async load(addObject, onProgress, onError) {
    let first = true;
    let current = 0;
    let total = 0;
    let viewerLoads = 0;
    let firstObjectPromise = null;
    for await (let obj of this.loader.getObjectIterator()) {
      if (first) {
        firstObjectPromise = this.converter.traverseAndConvert(obj, (o) => {
          console.log("ADD TO SCENEMANAGER:", o);
          addObject(o);
          viewerLoads++;
        });
        first = false;
        total = obj.totalChildrenCount;
      }
      current++;
      onProgress({ progress: current / (total + 1), id: this.objectId });
      // console.log( 'load-progress', { progress: current / ( total + 1 ), id: this.objectId } )
      // this.viewer.emit( 'load-progress', { progress: current / ( total + 1 ), id: this.objectId } )
    }

    if (firstObjectPromise) {
      await firstObjectPromise;
    }

    if (viewerLoads === 0) {
      onError({
        warning: `Viewer: no 3d objects found in object ${this.objectId}`,
      });
      // console.warn( `Viewer: no 3d objects found in object ${this.objectId}` )
      // this.viewer.emit( 'load-warning', { message: `No displayable objects found in object ${this.objectId}.` } )
    }
  }
}
