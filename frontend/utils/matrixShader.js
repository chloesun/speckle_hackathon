// Based on https://www.shadertoy.com/view/MlfXzN
// https://shaderfrog.com/app/view/3018?view=shader
const vertexShader = `
precision highp float;
precision highp int;

varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}
`;

const fragmentShader = `
precision highp float;
precision highp int;

uniform float time;
uniform float speed;

uniform vec2 charSize;
uniform float charResolution;
uniform vec3 color;
uniform vec2 resolution;

varying vec2 vUv;

float seed = 2.0;

float random( float x ) {
    return fract( sin( x ) * 43758.5453 );
}

float random( vec2 st ) {
    return fract( sin( dot( st.xy, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 );
}

float randomChar( vec2 outer, vec2 inner ) {
    vec2 margin = 1.0 - charSize;
    vec2 borders = step( margin, inner ) * step( margin, 1.0 - inner );
    return step(
        0.5,
        random( outer * seed + floor( inner * charResolution ) )
    ) * borders.x * borders.y;
}

vec4 matrix( vec2 st ) {
    float rows = 50.0;
    vec2 ipos = floor( st * rows ) + vec2( 1.0, 0.0 );

    ipos += vec2( 0.0, floor( time * speed * random( ipos.x ) ) );

    vec2 fpos = fract( st * rows );
    vec2 center = 0.5 - fpos;

    float pct = random( ipos );
    float glow = ( 1.0 - dot(center,center) * 3.0 ) * 2.0;

    float result = randomChar( ipos, fpos ) * pct * glow;
    return vec4( color * result, result );
}

void main() {

	vec2 st = vUv * resolution;
	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0) + matrix( st );

}
`;

export const uniforms = {
  time: { value: 0.0 },
  speed: { value: 18.0 },
  charSize: { value: { x: 2.0, y: 1.5 } },
  charResolution: { value: 0.0 },
  color: { value: new THREE.Color("green") },
  resolution: { value: { x: 1.0, y: 1.0 } },
};

export const shaderMaterial = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});
