//https://codepen.io/pen?&editors=101
//https://r105.threejsfundamentals.org/threejs/lessons/threejs-shadertoy.html

const fragmentShader = `
#include <common>

uniform vec3 iResolution;
uniform float time;
uniform sampler2D iChannel0;

// By Daedelus: https://www.shadertoy.com/user/Daedelus
// license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
#define TIMESCALE 0.25 
#define TILES 8
#define COLOR 0.7, 1.6, 2.8

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  vec2 uv = fragCoord.xy / iResolution.xy;
  uv.x *= iResolution.x / iResolution.y;
  
  vec4 noise = texture2D(iChannel0, floor(uv * float(TILES)) / float(TILES));
  float p = 1.0 - mod(noise.r + noise.g + noise.b + time * float(TIMESCALE), 1.0);
  p = min(max(p * 3.0 - 1.8, 0.1), 2.0);
  
  vec2 r = mod(uv * float(TILES), 1.0);
  r = vec2(pow(r.x - 0.5, 2.0), pow(r.y - 0.5, 2.0));
  p *= 1.0 - pow(min(1.0, 12.0 * dot(r, r)), 2.0);
  
  fragColor = vec4(COLOR, 1.0) * p;
}

varying vec2 vUv;

void main() {
  mainImage(gl_FragColor, vUv * iResolution.xy);
}
`;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`;

const loader = new THREE.TextureLoader();
const texture = loader.load(
  "https://r105.threejsfundamentals.org/threejs/resources/images/bayer.png"
);
texture.minFilter = THREE.NearestFilter;
texture.magFilter = THREE.NearestFilter;
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;

export const uniforms = {
  time: { value: 0 },
  iResolution: { value: new THREE.Vector3(1, 1, 1) },
  iChannel0: { value: texture },
};

export const shaderMaterial = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});
