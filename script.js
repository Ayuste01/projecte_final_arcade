// ============================================================
// CONFIGURACIÓN — ajusta la rotación inicial del modelo aquí
// Math.PI = 180°, Math.PI/2 = 90°
// ============================================================
const CONFIG = {
  rotX: 0,       // inclinar arriba/abajo
  rotY: 0,       // girar izquierda/derecha
  rotZ: 0,       // ladear
  autoRotate: true,   // rotación automática suave
  rotateSpeed: 0.4,   // velocidad de rotación
};
// ============================================================

const canvas = document.getElementById("canvas-arcade");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  30,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  100
);

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
});
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Luces
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const d1 = new THREE.DirectionalLight(0xffffff, 2);
d1.position.set(3, 5, 5);
scene.add(d1);
const d2 = new THREE.DirectionalLight(0xffffff, 0.4);
d2.position.set(-3, -2, -3);
scene.add(d2);

let model;

const loader = new THREE.GLTFLoader();
loader.load(
  "models/arcade_web.glb",
  (gltf) => {
    model = gltf.scene;

    // Centrar y escalar automáticamente
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    model.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const fovRad = (30 * Math.PI) / 180;
    let dist = (maxDim / 2) / Math.tan(fovRad / 2);
    camera.position.z = dist * 1.5;
    camera.position.y = dist * 0.28;

    // Rotación inicial desde CONFIG
    model.rotation.x = CONFIG.rotX;
    model.rotation.y = CONFIG.rotY;
    model.rotation.z = CONFIG.rotZ;

    scene.add(model);
  },
  undefined,
  (err) => console.error("Error cargando modelo:", err)
);

// Render loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  if (model && CONFIG.autoRotate) {
    model.rotation.y = CONFIG.rotY + t * CONFIG.rotateSpeed;
    // Flotación suave
    model.position.y = Math.sin(t * 0.8) * 0.05;
  }

  renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener("resize", () => {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});