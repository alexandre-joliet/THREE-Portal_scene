import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import firefliesVertexShader from "./shaders/fireflies/vertex.glsl";
import firefliesFragmentShader from "./shaders/fireflies/fragment.glsl";
import portalVertexShader from "./shaders/portal/vertex.glsl";
import portalFragmentShader from "./shaders/portal/fragment.glsl";

/**
 * Base
 */
// Debug
const debugObject = {
  // clearColor is the name used by Three.js to manage the background color
  clearColor: "#001524",
  portalColorStart: "#ea0000",
  portalColorEnd: "#ff5e5e",
};

// const gui = new GUI({
//   width: 300,
// });

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader();

// GLTF loader
const gltfLoader = new GLTFLoader();

/**
 * Textures
 */
const bakedTexture = textureLoader.load("portal_baked.jpg");
bakedTexture.flipY = false;
bakedTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Materials
 */
// Baked material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });

// Polelight material
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: "#ffdddd" });
poleLightMaterial.colorSpace = THREE.SRGBColorSpace;
// gui.addColor(poleLightMaterial, "color").name("Polelight color");

// Circle material
// const circleLightMaterial = new THREE.MeshBasicMaterial({
//   color: "#ffb8b8",
//   side: THREE.DoubleSide,
// });
// circleLightMaterial.colorSpace = THREE.SRGBColorSpace;
// gui.addColor(circleLightMaterial, "color");

// Portal custom shader material
const portalLightMaterial = new THREE.ShaderMaterial({
  vertexShader: portalVertexShader,
  fragmentShader: portalFragmentShader,
  side: THREE.DoubleSide,
  uniforms: {
    uTime: { value: 0 },
    uColorStart: { value: new THREE.Color("#ea0000") },
    uColorEnd: { value: new THREE.Color("#ff5e5e") },
  },
});

// gui.addColor(debugObject, "portalColorStart").onChange(() => {
//   portalLightMaterial.uniforms.uColorStart.value.set(
//     debugObject.portalColorStart
//   );
// });
// gui.addColor(debugObject, "portalColorEnd").onChange(() => {
//   portalLightMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd);
// });

/**
 * Models
 */
gltfLoader.load("portal_update_BAKING2_merge.glb", (gltf) => {
  // For the unoptimized version only
  // gltf.scene.traverse((child) => {
  //   child.material = bakedMaterial;
  // });

  const bakedMesh = gltf.scene.children.find(
    (item) => item.name === "merge_baked"
  );
  bakedMesh.material = bakedMaterial;

  const poleLightMesh1 = gltf.scene.children.find(
    (item) => item.name === "Pole_Lamp"
  );
  poleLightMesh1.material = poleLightMaterial;

  const poleLightMesh2 = gltf.scene.children.find(
    (item) => item.name === "Pole_Lamp001"
  );
  poleLightMesh2.material = poleLightMaterial;

  const lanternLightMesh = gltf.scene.children.find(
    (item) => item.name === "Lantern_Light"
  );
  lanternLightMesh.material = poleLightMaterial;

  // Without custom shader material
  //   const circleLightMesh = gltf.scene.children.find(
  //     (item) => item.name === "Portal_Circle"
  //   );
  //   circleLightMesh.material = circleLightMaterial;

  // With custom shader material
  const circleLightMesh = gltf.scene.children.find(
    (item) => item.name === "Portal_Circle"
  );
  circleLightMesh.material = portalLightMaterial;

  scene.add(gltf.scene);
});

/**
 * Fireflies
 */
// Geometry
const firefliesGeometry = new THREE.BufferGeometry();
const firefliesCount = 50;
const firefliesPositionArray = new Float32Array(firefliesCount * 3);
const firefliesScaleArray = new Float32Array(firefliesCount * 1); // 1 because we only need one value here

for (let i = 0; i < firefliesCount; i++) {
  firefliesPositionArray[i * 3 + 0] = (Math.random() - 0.5) * 4;
  firefliesPositionArray[i * 3 + 1] = Math.random() * 2;
  firefliesPositionArray[i * 3 + 2] = (Math.random() - 0.5) * 4;

  firefliesScaleArray[i] = Math.random();
}

firefliesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(firefliesPositionArray, 3)
); // 3 because we need the 3 coordinates

firefliesGeometry.setAttribute(
  "aScale",
  new THREE.BufferAttribute(firefliesScaleArray, 1)
);

// Material
const firefliesMaterial = new THREE.ShaderMaterial({
  vertexShader: firefliesVertexShader,
  fragmentShader: firefliesFragmentShader,
  transparent: true,
  blending: THREE.AdditiveBlending, // to make them look like points of light
  depthWrite: false, // to avoid to have objects hidding others
  uniforms: {
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }, // formula taken from the renderer
    uSize: { value: 200 },
  },
});

// gui
//   .add(firefliesMaterial.uniforms.uSize, "value")
//   .min(0)
//   .max(500)
//   .step(1)
//   .name("Fireflies size");

// Points
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial);
scene.add(fireflies);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Update fireflies material for potential changes of pixel ratio when switching screens
  firefliesMaterial.uniforms.uPixelRatio.value = Math.min(
    window.devicePixelRatio,
    2
  );
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});

renderer.setClearColor(debugObject.clearColor);
// gui
//   .addColor(debugObject, "clearColor")
//   .onChange(() => {
//     renderer.setClearColor(debugObject.clearColor);
//   })
//   .name("Backgound color");

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update material
  firefliesMaterial.uniforms.uTime.value = elapsedTime;
  portalLightMaterial.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
