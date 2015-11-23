var scene, camera, renderer;
var cannon, cannonSphere, isFiring, fireCount;
var windowWidth, windowHeight;
var mouse, raycaster;
var $$$ = [];

function Cash(position, rotation) {
  this.startPosition = position.clone();
  this.startRotation = rotation.clone();
  this.mesh = null;
  this.velocity = new THREE.Vector3(0, 0, 0);
}

Cash.prototype.addToScene = function(scene) {
  var geometry = new THREE.BoxGeometry(0.8, 0.01, 2.08);
  var material = new THREE.MeshPhongMaterial({ color: 0xA4BD99 });
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.position.copy(this.startPosition);
  this.mesh.rotation.copy(this.startRotation);
  this.mesh.translateZ(-1);
  scene.add(this.mesh);

  this.mesh.updateMatrixWorld();
  this.velocity = this.mesh.localToWorld(new THREE.Vector3(0, 0, 1));
  this.velocity.setLength(0.5);
  this.velocity.addScaledVector(cannon.velocity, 0.5);
};

Cash.prototype.update = function(t) {
  this.velocity.y = this.velocity.y - 1 * t;

  this.mesh.position.add(this.velocity);
};

Cash.prototype.destroy = function(scene) {
  scene.remove(this.mesh);
};

function Cannon() {
  this.velocity = new THREE.Vector3(0, 0, 0);
  this.angularVelocity = new THREE.Vector3(0, 0, 0);
  this.mesh = null;
};

Cannon.prototype.addToScene = function(scene) {
  var cannonMaterial = new THREE.MeshPhongMaterial({ color: 0xBD99A4 });
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
    var part = new THREE.Mesh(geometry, cannonMaterial);
    part.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI/2);
    cannon.add(part);
  };
  this.mesh = cannon;
  scene.add(this.mesh);
};

Cannon.prototype.update = function(t) {
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObject(cannonSphere, true);
  if (intersects.length > 0) {
    var intersect = intersects[ 0 ];
    var pos = this.mesh.position.clone();
    this.velocity.addScaledVector(intersect.point.sub(pos), 0.1);
  }

  this.velocity.multiplyScalar(0.75);
  this.mesh.position.add(this.velocity);

  var rotation = this.mesh.rotation.toVector3();
  this.mesh.lookAt(cannonSphere.position);
  var targetRotation = this.mesh.rotation.toVector3();

  this.angularVelocity.addScaledVector(targetRotation.sub(rotation), 0.1);
  this.angularVelocity.multiplyScalar(0.75);

  this.mesh.rotation.setFromVector3(rotation.add(this.angularVelocity));
};

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
  camera.position.y = 5;

  cannon = new Cannon();
  cannon.addToScene(scene);

  var geometry = new THREE.SphereGeometry(20, 20, 20);
  geometry.translate(0, 0, 0);
  geometry.scale(1, 0.7, 0.4);
  var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true, side: THREE.BackSide });
  cannonSphere = new THREE.Mesh(geometry, material);
  cannonSphere.visible = false;
  scene.add(cannonSphere);

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0xf0f0f0);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  window.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('mousedown', onMouseDown, false);
  window.addEventListener('mouseup', onMouseUp, false);
}

function render() {
  requestAnimationFrame(render);

  cannon.update(1.0 / 60.0);

  for (var i = $$$.length - 1; i >= 0; i--) {
    var $ = $$$[i];
    $.update(1.0 / 60.0);

    if ($.mesh.position.y < -80) {
      $.destroy(scene);
      $$$.splice(i, 1);
    }
  }

  if (window.innerWidth != windowWidth || window.innerHeight != windowHeight) {
    resizeRenderer();
  }

  if (isFiring) {
    if (fireCount == 0) {
      var $ = new Cash(cannon.mesh.position, cannon.mesh.rotation);
      $.addToScene(scene);
      $$$.push($);
      fireCount = 5;
    } else {
      fireCount--;
    }
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

function onMouseDown(e) {
  e.preventDefault();
  isFiring = true;
  fireCount = 0;
}

function onMouseUp(e) {
  e.preventDefault();
  isFiring = false;
}
