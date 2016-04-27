var THREE = require('three');
var TWEEN = require('tween.js');
var combineOptions = require('./options.js');
var createParticleView = require('./lib/particle-view.js');
var createLineView = require('./lib/line-view.js');
var createHitTest = require('./lib/hit-test.js');
var createAutoPilot = require('./lib/auto-pilot.js');
var flyControls = require('three.fly');
var normalizeColor = require('./lib/normalize-color.js');

// Expose three.js as well, so simple clients do not have to require it
unrender.THREE = THREE;
unrender.TWEEN = TWEEN;

module.exports = unrender;

function unrender(container, options) {
  var api = {
    destroy: destroy,
    scene: getScene,
    camera: getCamera,
    input: getInput,
    renderer: getRenderer,
    // todo: this should all be refactored into single particles class.
    particles: particles,
    getParticleView: getParicleView,
    hitTest: getHitTest,
    lines: drawLines,
    onFrame: onFrame,
    offFrame: offFrame,
    lookAt: lookAt,
    around: around,
    getContainer: getContainer
  };

  options = combineOptions(options);
  var lastFrame;
  var rafCallbacks = [];

  var scene = createScene();
  var camera = createCamera();
  var renderer = createRenderer();
  var particleView = createParticleView(scene);
  var lineView = createLineView(scene);
  var input = createInputHandler();
  var autoPilot = createAutoPilot(camera);

  // TODO: This doesn't seem to belong here... Not sure where to put it
  var hitTest = createHitTest(particleView, container, input);
  var updateTween = window.performance ? highResTimer : dateTimer;

  startEventsListening();

  frame();

  return api;

  function getHitTest() {
    return hitTest;
  }

  function createInputHandler() {
    var controls = flyControls(camera, container, THREE);
    controls.movementSpeed = 200;
    controls.rollSpeed = 0.065;

    return controls;
  }

  function frame(time) {
    lastFrame = requestAnimationFrame(frame);
    renderer.render(scene, camera);
    hitTest.update(scene, camera);
    input.update(0.1);
    updateTween(time);

    for (var i = 0; i < rafCallbacks.length; ++i) {
      rafCallbacks[i](time);
    }
  }

  function getParicleView() {
    return particleView;
  }

  function particles(coordinates) {
    // todo: this should go away when we refactor this into single view
    if (coordinates === undefined) {
      return particleView.coordinates();
    }
    particleView.initWithNewCoordinates(coordinates);

    if (hitTest) hitTest.destroy();
    hitTest = createHitTest(particleView, container, input);

    return api;
  }

  function getContainer() {
    return container;
  }

  function destroy() {
    hitTest.destroy();
    input.destroy();
    stopEventsListening();
    container.removeChild(renderer.domElement);
  }

  function createScene() {
    var scene = new THREE.Scene();
    scene.sortObjects = false;
    return scene;
  }

  function getScene() {
    return scene;
  }

  function createCamera() {
    var camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 20000);
    scene.add(camera);

    return camera;
  }

  function getCamera() {
    return camera;
  }

  function getInput() {
    return input;
  }

  function onFrame(callback) {
    rafCallbacks.push(callback)
  }

  function offFrame(callback) {
    var idx = rafCallbacks.indexOf(callback);
    if (idx < 0) return;
    rafCallbacks.splice(idx, 1);
  }

  function createRenderer() {
    var renderer = new THREE.WebGLRenderer({
      antialias: false
    });

    renderer.setClearColor(options.clearColor, 1);
    renderer.setSize(container.clientWidth, container.clientHeight);

    container.appendChild(renderer.domElement);
    return renderer;
  }

  function getRenderer() {
    return renderer;
  }

  function startEventsListening() {
    window.addEventListener('resize', onWindowResize, false);
  }

  function stopEventsListening() {
    window.removeEventListener('resize', onWindowResize, false);
    cancelAnimationFrame(lastFrame);
  }

  function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  function drawLines(lines, color) {
    lineView.draw(lines, color);
  }

  function around(r, x, y, z) {
    autoPilot.around(r, x, y, z);
  }

  function lookAt(index, done, distanceFromTarget) {
    // todo: this should tak x,y,z instead
    var points = particleView.coordinates()
    var pos = {
      x: points[index],
      y: points[index + 1],
      z: points[index + 2]
    };

    autoPilot.flyTo(pos, done, distanceFromTarget);
  }

  function highResTimer(time) {
    TWEEN.update(time);
  }

  function dateTimer(time) {
    TWEEN.update(+new Date());
  }
}
