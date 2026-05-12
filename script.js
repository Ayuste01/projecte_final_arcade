//Three.js — librería 3D para web. Maneja escena, cámara, luces y render usando WebGL por debajo.
//GLTFLoader — extensión de Three.js para cargar archivos .glb/.gltf

// CONFIG - ajusta estos valores para cambiar como se ve el modelo
// rotX: inclinar arriba/abajo (Math.PI/2 = 90 grados)
// rotY: girar izquierda/derecha
// rotZ: ladear
// autoRotate: true/false para activar rotacion automatica
// rotateSpeed: velocidad de rotacion, mas alto = mas rapido
const CONFIG = {
  rotX: 0,
  rotY: 0,
  rotZ: 0,
  autoRotate: true,
  rotateSpeed: 0.4,
};

// Agarra el canvas del HTML donde se dibujara el modelo
const canvas = document.getElementById("canvas-arcade");

// El "mundo 3D" donde metes modelos y luces
const scene = new THREE.Scene();

// Camara
// 30 = angulo de vision, mas alto = mas zoom out
// 0.1 y 100 = distancia minima y maxima que ve
const camera = new THREE.PerspectiveCamera(30, canvas.clientWidth / canvas.clientHeight, 0.1, 100);

// El motor que dibuja todo en el canvas
// alpha: fondo transparente | antialias: bordes suavizados
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

// Tamano del render igual al tamano del canvas
renderer.setSize(canvas.clientWidth, canvas.clientHeight);

// Nitidez en pantallas de alta resolucion, maximo 2 para no sobrecargar
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Luz ambiental - ilumina todo por igual, como luz de dia
scene.add(new THREE.AmbientLight(0xffffff, 0.8));

// Luz direccional fuerte desde arriba-derecha (como el sol)
const d1 = new THREE.DirectionalLight(0xffffff, 2);
d1.position.set(3, 5, 5);
scene.add(d1);

// Luz secundaria suave desde el lado contrario para evitar sombras negras
const d2 = new THREE.DirectionalLight(0xffffff, 0.4);
d2.position.set(-3, -2, -3);
scene.add(d2);

// Variable donde guardaremos el modelo cuando termine de cargar
let model;

// Crea el cargador de archivos GLB
const loader = new THREE.GLTFLoader();

// Carga el archivo GLB
// param 1: ruta del archivo
// param 2: funcion que se ejecuta cuando carga bien
// param 3: undefined = ignoramos el progreso de carga
// param 4: funcion si hay error
loader.load(
  "models/arcade_web.glb",
  (gltf) => {
    // El modelo 3D esta dentro de gltf.scene
    model = gltf.scene;

    // Caja imaginaria que rodea el modelo para calcular su tamano y centro
    const box = new THREE.Box3().setFromObject(model);

    // Centro geometrico del modelo
    const center = box.getCenter(new THREE.Vector3());

    // Tamano total del modelo (ancho, alto, profundo)
    const size = box.getSize(new THREE.Vector3());

    // Mueve el modelo para que su centro quede en el origen (0,0,0)
    // Sin esto apareceria desplazado
    model.position.sub(center);

    // La dimension mas grande del modelo
    const maxDim = Math.max(size.x, size.y, size.z);

    // Convierte el FOV de grados a radianes (matematicas)
    const fovRad = (30 * Math.PI) / 180;

    // Calcula a que distancia poner la camara para que el modelo quepa entero
    const dist = (maxDim / 2) / Math.tan(fovRad / 2);

    // Aleja la camara en Z (hacia el espectador), 1.5 es el margen
    camera.position.z = dist * 1.5;

    // Sube la camara un poco para centrar mejor el modelo visualmente
    camera.position.y = dist * 0.28;

    // Aplica la rotacion inicial del CONFIG
    model.rotation.x = CONFIG.rotX;
    model.rotation.y = CONFIG.rotY;
    model.rotation.z = CONFIG.rotZ;

    // Mete el modelo en la escena para que se vea
    scene.add(model);
  },
  undefined,
  (err) => console.error("Error:", err)
);

// Reloj interno de Three.js para animar con el tiempo
const clock = new THREE.Clock();

// Bucle de animacion - se ejecuta ~60 veces por segundo
function animate() {
  // Le dice al navegador que llame a animate() antes del siguiente frame
  requestAnimationFrame(animate);

  // Segundos transcurridos desde el inicio
  const t = clock.getElapsedTime();

  if (model && CONFIG.autoRotate) {
    // Gira el modelo en Y continuamente segun el tiempo
    model.rotation.y = CONFIG.rotY + t * CONFIG.rotateSpeed;

    // Flotacion suave: seno crea movimiento arriba/abajo continuo
    model.position.y = Math.sin(t * 0.8) * 0.05;
  }

  // Dibuja la escena desde el punto de vista de la camara
  renderer.render(scene, camera);
}

// Arranca el bucle
animate();

// Cuando el usuario cambia el tamano de la ventana
window.addEventListener("resize", () => {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  // Actualiza la proporcion de la camara
  camera.aspect = w / h;

  // Obligatorio despues de cambiar aspect
  camera.updateProjectionMatrix();

  // Redibuja al nuevo tamano
  renderer.setSize(w, h);
});



