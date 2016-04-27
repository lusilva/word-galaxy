/**
 * This is an auto pilot which knows how to fly to a given X,Y,Z coordinate
 */

var THREE = require('three');
var TWEEN = require('tween.js');
var intersect = require('./intersect');

module.exports = autoPilot;

function autoPilot(camera) {
  return {
    flyTo: flyTo,
    around: around
  };

  function around(r, x, y, z) {
    if (typeof r !== 'number') r = 1000;
    if (typeof x !== 'number') x = 0;
    if (typeof y !== 'number') y = 0;
    if (typeof z !== 'number') z = 0;

    var center = new THREE.Vector3(x, y, z);

    new TWEEN.Tween({theta: 0}).to({ theta: 2 * Math.PI}, 6000)
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate(moveCamera)
      .start();

      function moveCamera() {
        var pos = getPositionOnSurface(r, x, y, z, this.theta);
        var constant = 1;
        camera.position.x = center.x + r * Math.cos( constant * this.theta );
        camera.position.z = center.z + r * Math.sin( constant * this.theta );
        camera.position.y += r * 0.002 *( Math.cos(constant * this.theta));
        camera.lookAt(center);
      }
  }

  function getPositionOnSurface(r, x, y, z, theta) {
    var phi = Math.PI/2;
    return {
      x: x + r * Math.cos(theta) * Math.sin(phi),
      y: y + r * Math.sin(theta) * Math.sin(phi),
      z: z + r * Math.cos(phi)
    };
  }

  function flyTo(to, done, cameraOffset) {
    if (typeof done === 'number') {
      cameraOffset = done;
      done = undefined;
    }
    cameraOffset = typeof cameraOffset === 'number' ? cameraOffset : 100;
    // copy camera's current position - we will be animating this value
    var from = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    };

    // Camera needs to stop at given distance from target's center
    var cameraEndPos = intersect(from, to, cameraOffset);

    // Move camera from its current position to target:
    new TWEEN.Tween(from).to(cameraEndPos, 400)
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate(moveCamera)
      .onComplete(function() {
        if (typeof done === 'function') done();
      })
      .start();

    // Also rotate camera while it flies to an object:
    var startRotation = new THREE.Quaternion().copy(camera.quaternion);
    camera.lookAt(new THREE.Vector3(to.x, to.y, to.z));
    var endRotation = new THREE.Quaternion().copy(camera.quaternion);
    camera.quaternion.copy(startRotation); // revert to original rotation

    new TWEEN.Tween({
      x: startRotation.x,
      y: startRotation.y,
      z: startRotation.z,
      w: startRotation.w
    }).to({
      x: endRotation.x,
      y: endRotation.y,
      z: endRotation.z,
      w: endRotation.w
    }, 300).onUpdate(rotateCamera).start();
  }

  function rotateCamera() {
    camera.quaternion.set(this.x, this.y, this.z, this.w);
  }

  function moveCamera(pos) {
    camera.position.x = this.x;
    camera.position.y = this.y;
    camera.position.z = this.z;
  }
}
