var scene, camera, renderer;
var cannon, cannonSphere;
var windowWidth, windowHeight;
var mouse, raycaster;

document.addEventListener('DOMContentLoaded', function() {
  initScene();
  render();
}, false);

document.addEventListener()

function initScene() {
  scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0x404040));
  scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1));

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.z = 10;

  cannon = createCannon();
  scene.add(cannon);

  var geometry = new THREE.SphereGeometry(20, 20, 20);
  geometry.translate(0, 0, 5);
  var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true, side: THREE.BackSide });
  cannonSphere = new THREE.Mesh(geometry, material);
  cannonSphere.visible = false;
  scene.add(cannonSphere);

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0xf0f0f0 );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  window.addEventListener('mousemove', onMouseMove, false);
}

function createCannon() {
  var cannonMaterial = new THREE.MeshPhongMaterial({ color: 0xA4BD99 });
  var cannonMatricies = [
    [2.75,0,0,0,0,0.7,0,0,0,0,1,0,-0.72,0,0,1],
    [0.74,0.18,0,0,-0.34,1.4,0,0,0,0,0.38,0,0.26,-0.81,0,1],
    [0.97,0.24,0,0,0,0.17,0,0,0,0,0.62,0,0.46,-1.56,0,1]
  ];
  var cannon = new THREE.Object3D();
  for (var i = 0; i < cannonMatricies.length; i++) {
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var m = new THREE.Matrix4();
    m.elements = cannonMatricies[i];
    geometry.applyMatrix(m);
    cannon.add(new THREE.Mesh(geometry, cannonMaterial));
  };
  return cannon;
}

function createBill() {
  var geometry = new THREE.BoxGeometry(2.61, 0.10, 6.14);
  var material = new THREE.MeshBasicMaterial({ color: 0xA4BD99, wireframe: false });
  return new THREE.Mesh(geometry, material);
}

function render() {
  requestAnimationFrame(render);

  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObject(cannonSphere, true);
  if (intersects.length > 0) {
    var intersect = intersects[ 0 ];
    cannon.position.copy(intersect.point);
    cannon.lookAt(cannonSphere.position);
    cannon.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI/2);
  }

  if (window.innerWidth != windowWidth || window.innerHeight != windowHeight) {
    resizeRenderer();  
  }

  if (document.hasFocus()) {
    renderer.render(scene, camera);
  }
}

function resizeRenderer() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;
}

function onMouseMove(e) {
  e.preventDefault();

  mouse.x = (event.clientX/window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY/window.innerHeight) * 2 + 1;
}