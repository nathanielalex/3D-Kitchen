import * as THREE from "./threejs/build/three.module.js";

import { OrbitControls } from "./threejs/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "./threejs/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "./threejs/examples/jsm/geometries/TextGeometry.js";
import { GLTFLoader } from "./threejs/examples/jsm/loaders/GLTFLoader.js";

var scene, camera1, camera2, renderer, selectedCamera;
var controls;
var raycaster;
var burger;
var vacuum;
var msgText;

const createBox = (width, height, depth, color) => {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({
    color: color,
    wireframe: false,
    roughness: 0,
    metalness: 0,
  });
  return new THREE.Mesh(geometry, material);
};

const createTexturedBox = (width, height, depth, path) => {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(path);

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 5);

  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({
    wireframe: false,
    roughness: 0,
    metalness: 0,
    map: texture,
  });
  return new THREE.Mesh(geometry, material);
};

const createPlane = (width, height, texturePath) => {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(texturePath);

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 5);

  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    wireframe: false,
    map: texture,
  });

  return new THREE.Mesh(geometry, material);
};

const createCylinder = (radiusTop, radiusBottom, height, color) => {
  const geometry = new THREE.CylinderGeometry(
    radiusTop,
    radiusBottom,
    height,
    20
  );
  const material = new THREE.MeshLambertMaterial({
    color: color,
  });
  return new THREE.Mesh(geometry, material);
};
const createEmssiveCylinder = (
  radiusTop,
  radiusBottom,
  height,
  color,
  emissive
) => {
  const geometry = new THREE.CylinderGeometry(
    radiusTop,
    radiusBottom,
    height,
    20
  );
  const material = new THREE.MeshStandardMaterial({
    color: color,
    emissive: emissive,
    emissiveIntensity: 5,
  });
  return new THREE.Mesh(geometry, material);
};

const createOpenEndedCylinder = (radiusTop, radiusBottom, height, color) => {
  const geometry = new THREE.CylinderGeometry(
    radiusTop,
    radiusBottom,
    height,
    32,
    1,
    true
  );
  const material = new THREE.MeshLambertMaterial({
    color: color,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(geometry, material);
};

const createSphere = (radius, color) => {
  const geometry = new THREE.SphereGeometry(radius);
  const material = new THREE.MeshLambertMaterial({ color: color });
  return new THREE.Mesh(geometry, material);
};

const createAmbientLight = () => {
  return new THREE.AmbientLight(0xffffff, 0.5);
};

const createPointLight = (intensity, distance, decay) => {
  const light = new THREE.PointLight(0xfff3b5, intensity, distance);
  light.decay = decay; // Default is 1
  // const lightHelper = new THREE.PointLightHelper(light, 0.5, 0x000000);
  // scene.add(lightHelper);
  return light;
};

const init = () => {
  scene = new THREE.Scene();

  const textureLoader = new THREE.TextureLoader();

  //skybox
  const skyboxGeometry = new THREE.BoxGeometry(15, 10, 15);
  const rightMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textureLoader.load("./assets/skybox/sky_test_right.png"),
    side: THREE.BackSide,
  });
  const leftMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textureLoader.load("./assets/skybox/sky_test_left.png"),
    side: THREE.BackSide,
  });
  const topMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textureLoader.load("./assets/skybox/sky_test_up.png"),
    side: THREE.BackSide,
  });
  const bottomMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textureLoader.load("./assets/skybox/sky_test_down.png"),
    side: THREE.BackSide,
  });
  const frontMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textureLoader.load("./assets/skybox/sky_test_front.png"),
    side: THREE.BackSide,
  });
  const backMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textureLoader.load("./assets/skybox/sky_test_back.png"),
    side: THREE.BackSide,
  });
  const skyboxMesh = new THREE.Mesh(skyboxGeometry, [
    rightMat,
    leftMat,
    topMat,
    bottomMat,
    frontMat,
    backMat,
  ]);

  //kitchen room
  const roomGeometry = new THREE.BoxGeometry(5, 3.5, 5);
  const rightMatRoom = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textureLoader.load("./assets/wallpaper.jpg"),
    side: THREE.BackSide,
    opacity: 1.0,
    transparent: false,
  });
  const leftMatRoom = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textureLoader.load("./assets/wallpaper.jpg"),
    side: THREE.BackSide,
    opacity: 1.0,
    transparent: false,
  });
  const topMatRoom = new THREE.MeshStandardMaterial({
    color: 0xffffff,

    side: THREE.BackSide,
    opacity: 1.0,
    transparent: false,
  });

  const bottomMatRoom = new THREE.MeshStandardMaterial({
    color: 0xffffff,

    side: THREE.BackSide,
    opacity: 1.0,
    transparent: false,
  });
  const frontMatRoom = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textureLoader.load("./assets/wallpaper.jpg"),
    side: THREE.BackSide,
    opacity: 1.0,
    transparent: false,
  });
  const backMatRoom = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textureLoader.load("./assets/wallpaper.jpg"),
    side: THREE.BackSide,
    opacity: 1.0,
    transparent: false,
  });

  const roomMesh = new THREE.Mesh(roomGeometry, [
    rightMatRoom,
    leftMatRoom,
    topMatRoom,
    bottomMatRoom,
    frontMatRoom,
    backMatRoom,
  ]);

  roomMesh.receiveShadow = true;
  roomMesh.position.y = 1;

  scene.add(roomMesh);
  scene.add(skyboxMesh);

  camera1 = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera2 = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  //camera1 for orbit
  camera1.position.set(5, 5, 5);
  camera1.lookAt(0, 0, 0);

  //camera2 for closeup
  camera2.position.set(0, 1, 1);
  camera2.lookAt(0, 0, 0);

  selectedCamera = camera2;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera1, renderer.domElement);

  //geometry
  const floor = createPlane(5, 5, "./assets/diagonal_parquet_diff_1k.jpg");
  floor.rotation.set(Math.PI / 2, 0, 0);
  floor.position.y = 0;
  const ceiling = createPlane(5, 5, "./assets/ceiling.jpg");
  ceiling.rotation.set(Math.PI / 2, 0, 0);
  ceiling.position.y = 2.5;

  const grass = createPlane(10, 10, "./assets/aerial_grass_rock_diff_1k.jpg");
  grass.rotation.set(Math.PI / 2, 0, 0);
  grass.position.y = -0.8;

  const baseMiddleTable = createBox(1.2, 0.4, 1.2, 0xf0b981);
  baseMiddleTable.position.set(0, 0.1, 0);

  const coverMiddleTable = createTexturedBox(
    1.3,
    0.05,
    1.3,
    "./assets/long_white_tiles_diff_1k.jpg"
  );
  coverMiddleTable.position.set(0, 0.325, 0);
  coverMiddleTable.userData.ground = true;
  coverMiddleTable.castShadow = true;
  coverMiddleTable.receiveShadow = true;

  const plate = createCylinder(0.1, 0.1, 0.05, 0xb8b8b8);
  plate.position.set(0.4, 0.35, 0.4);
  plate.userData.draggable = true;
  plate.userData.name = "PLATE";
  plate.castShadow = true;
  plate.receiveShadow = true;

  vacuum = createCylinder(0.1, 0.1, 0.05, 0xffffff);
  vacuum.position.set(1, 0, 1);
  vacuum.castShadow = true;
  vacuum.receiveShadow = true;

  const cuttingBoard = createBox(0.3, 0.05, 0.2, 0xffffff);
  cuttingBoard.position.set(-0.2, 0.35, 0.3);
  cuttingBoard.castShadow = true;
  cuttingBoard.receiveShadow = true;

  const cup = createOpenEndedCylinder(0.05, 0.05, 0.1, 0xb8b8b8);
  cup.position.set(0.2, 0.42, 0.4);
  const cupBase = createCylinder(0.05, 0.05, 0.05, 0xb8b8b8);
  cupBase.position.set(0.2, 0.35, 0.4);
  cup.castShadow = true;
  cup.receiveShadow = true;
  cupBase.castShadow = true;
  cupBase.receiveShadow = true;

  const orange = createSphere(0.05, 0xffa500);
  orange.position.set(0.05, 0.4, 0.4);
  orange.userData.draggable = true;
  orange.userData.name = "ORANGE";
  orange.castShadow = true;
  orange.receiveShadow = true;

  const stand = createCylinder(0.05, 0.05, 1, 0xffffff);
  stand.position.set(-1.5, 1.99, 1.5);
  stand.castShadow = true;
  stand.receiveShadow = true;

  const light1 = createPointLight(1, 10, 1);
  light1.position.set(1.5, 2.4, 1.5);
  light1.castShadow = true;

  const light2 = createPointLight(1, 10, 1);
  // light2.position.set(-1, 0.8, -2.1);
  light2.position.set(-1.5, 2.4, -1.5);
  light2.castShadow = true;

  const lightBulb1 = createEmssiveCylinder(0.1, 0.1, 0.05, 0xffe24d, 0xffe24d);
  lightBulb1.position.set(1.5, 2.47, 1.5);
  lightBulb1.castShadow = true;
  const lightBulb2 = createEmssiveCylinder(0.1, 0.1, 0.05, 0xffe24d, 0xffffff);
  lightBulb2.position.set(-1.5, 2.47, -1.5);
  lightBulb2.castShadow = true;

  floor.receiveShadow = true;
  ceiling.receiveShadow = true;

  const fontLoader = new FontLoader();
  fontLoader.load(
    "./threejs/examples/fonts/helvetiker_regular.typeface.json",
    (font) => {
      const geometry = new TextGeometry("Fuioyohhh", {
        font: font,
        size: 0.2,
        height: 0.05,
      });
      const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const text = new THREE.Mesh(geometry, material);
      text.position.set(0, 1.7, -2.5);
      text.receiveShadow = true;
      text.castShadow = true;
      scene.add(text);
      const geometry2 = new TextGeometry("MSG", {
        font: font,
        size: 0.2,
        height: 0.05,
      });
      const material2 = new THREE.MeshBasicMaterial({ color: 0x000000 });
      msgText = new THREE.Mesh(geometry2, material2);
      msgText.position.set(-1.5, 1.7, -2.5);
      msgText.receiveShadow = true;
      msgText.castShadow = true;
      scene.add(msgText);
    }
  );

  const gltfLoader = new GLTFLoader();
  gltfLoader.load("./assets/oven/scene.gltf", (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.2, 0.2, 0.2);
    model.position.set(-2, 0.2, -2);

    model.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });
    scene.add(model);
  });
  gltfLoader.load("./assets/burger/scene.gltf", (gltf) => {
    burger = gltf.scene;
    burger.scale.set(0.2, 0.2, 0.2);
    burger.position.set(-1.5, 1.4, 1.5);
    burger.rotation.y = Math.PI / 2;
    burger.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });
    scene.add(burger);
  });
  gltfLoader.load("./assets/shelf/scene.gltf", (gltf) => {
    const shelf = gltf.scene;
    shelf.scale.set(0.05, 0.05, 0.05);
    shelf.position.set(-1.5, 0, -1.9);
    shelf.rotation.y = Math.PI * 1.5;
    shelf.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });
    scene.add(shelf);
  });
  gltfLoader.load("./assets/fridge/scene.gltf", (gltf) => {
    const fridge = gltf.scene;
    fridge.scale.set(0.3, 0.3, 0.3);
    fridge.position.set(1, 0.6, -2.1);
    fridge.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });
    scene.add(fridge);
  });

  const objects = [
    floor,
    ceiling,
    grass,
    baseMiddleTable,
    coverMiddleTable,
    plate,
    cup,
    cupBase,
    orange,
    cuttingBoard,
    vacuum,
    stand,
    light1,
    light2,
    lightBulb1,
    lightBulb2,
    createAmbientLight(),
  ];
  objects.forEach((object) => {
    scene.add(object);
  });

  raycaster = new THREE.Raycaster();
};

const render = () => {
  requestAnimationFrame(render);
  animate();
  controls.update();
  renderer.setClearColor(0xcfcfcf);
  renderer.render(scene, selectedCamera);
};
const animate = () => {
  dragObject();
  moveVacuum();
  rotateText();
};

window.onload = () => {
  init();
  render();
};

window.onresize = () => {
  camera1.aspect = window.innerWidth / window.innerHeight;
  camera1.updateProjectionMatrix();

  camera2.aspect = window.innerWidth / window.innerHeight;
  camera2.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
};

const clickMouse = new THREE.Vector2();
const moveMouse = new THREE.Vector2();
var draggable;

window.addEventListener("click", (e) => {
  if (selectedCamera === camera1) {
    return;
  }

  if (draggable) {
    console.log("drop draggable" + draggable.userData.name);
    draggable = null;
    return;
  }

  clickMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  clickMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(clickMouse, camera2);
  const intersects = raycaster.intersectObjects(scene.children);
  //intersects is an array where it is sorted on the shortest distance
  if (intersects.length > 0 && intersects[0].object.userData.draggable) {
    draggable = intersects[0].object;
    console.log("found draggable" + draggable.userData.name);
  }
});

window.addEventListener("mousemove", (e) => {
  moveMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  moveMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

function dragObject() {
  if (draggable != null) {
    raycaster.setFromCamera(moveMouse, camera2);
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
      intersects.forEach((intersect) => {
        if (intersect.object.userData.ground) {
          draggable.position.x = intersect.point.x;
          draggable.position.z = intersect.point.z;
        }
      });
    }
  }
}

function spinBurger() {
  if (selectedCamera == camera1) {
    burger.rotation.y += 0.05;
  }
}

function rotateText() {
  if (msgText) {
    msgText.rotation.z += 0.05;
  }
}

window.addEventListener("keypress", (e) => {
  if (e.key.charCodeAt(0) === 32) {
    console.log("camera change");
    if (selectedCamera === camera1) {
      selectedCamera = camera2;
      controls.enabled = false;
    } else if (selectedCamera === camera2) {
      selectedCamera = camera1;
      controls.enabled = true;
    }
  }
  if (e.key.charCodeAt(0) === 115) {
    spinBurger();
  }
});

var speed = 0.01;
function moveVacuum() {
  if (vacuum.position.x >= 2.4) {
    speed = -0.01;
  } else if (vacuum.position.x <= -2.4) {
    speed = 0.01;
  }
  vacuum.position.x += speed;
}
