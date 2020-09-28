import * as THREE from 'three';
import {scene, renderer, camera} from 'app';
import {BufferGeometryUtils} from 'BufferGeometryUtils';

const sphere = new THREE.SphereBufferGeometry(10, 32, 32);

const img = new Image();
img.src = './hexagon.jpg';
const texture = new THREE.Texture(img);
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
img.onload = () => {
  texture.needsUpdate = true;
};
img.onerror = err => {
  console.warn(err.stack);
};

const material = new THREE.ShaderMaterial({
  uniforms: {
    tex: {type: 't', value: texture},
    iTime: {value: 0},
  },
  vertexShader: `\
    uniform float iTime;
    varying vec2 uvs;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    void main() {
      uvs = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      vNormal = normal;
      vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
      vWorldPosition = worldPosition.xyz;
    }
  `,
  fragmentShader: `\
    #define PI 3.1415926535897932384626433832795

    uniform float iTime;
    uniform sampler2D tex;
    varying vec2 uvs;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    const vec3 c = vec3(${new THREE.Color(0x1565c0).toArray().join(', ')});

    void main() {
      vec2 uv = uvs;
      uv.x *= 1.7320508075688772;
      uv *= 8.0;

      vec3 direction = vWorldPosition - cameraPosition;
      float d = dot(vNormal, normalize(direction));
      float glow = d < 0.0 ? max(1. + d * 2., 0.) : 0.;

      float animationFactor = (1.0 + sin((uvs.y*2. + iTime) * PI*2.))/2.;
      float a = glow + (1.0 - texture2D(tex, uv).r) * (0.01 + pow(animationFactor, 10.0) * 0.5);
      gl_FragColor = vec4(c, a);
    }
  `,
  side: THREE.DoubleSide,
  transparent: true,
});
skybox = new THREE.Mesh(sphere, material);
scene.add(skybox);

renderer.setAnimationLoop(() => {
  skybox.material.uniforms.iTime.value = ((Date.now() - startTime) % 3000) / 3000;
});