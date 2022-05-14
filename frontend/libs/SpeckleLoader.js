const {
  Group,
  Mesh,
  MeshNormalMaterial,
  MeshPhongMaterial,
  Loader,
  SmoothShading,
} = window.THREE;
import ViewerObjectLoader from "./ViewerObjectLoader.js";

class SpeckleLoader extends Loader {
  load(options, onLoad, onProgress, onError) {
    const { token, objectUrl } = JSON.parse(options);

    this.viewerObjectLoader = new ViewerObjectLoader(objectUrl, token);

    const container = new Group();

    // assign a color to the model
    const material = new MeshPhongMaterial({ color: 0xf0f8ff });

    const addObject = (o) => {
      const mesh = new Mesh(o.bufferGeometry, material);
      // mesh.geometry.computeFaceNormals();
      // mesh.geometry.computeVertexNormals();
      mesh.material.flatShading = SmoothShading;
      if (mesh.geometry.boundingSphere.center) {
        container.add(mesh);
      }
    };

    const onProgressInfo = (progress) => {
      //TODO not sure what structure the onProgress and onError for the threejs loaders expect
      console.log("onProgress", progress);
    };
    const onErrorInfo = (progress) => {
      console.log("onError", progress);
    };

    this.viewerObjectLoader
      .load(addObject, onProgressInfo, onErrorInfo)
      .then(() => {
        onLoad(container);
        // console.log("ok");
      });
  }
}

export { SpeckleLoader };
