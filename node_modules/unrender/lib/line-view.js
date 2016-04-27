var THREE = require('three');
var normalizeColor = require('./normalize-color.js');
module.exports = lineView;

function lineView(scene) {
  var api = {
    draw: draw
  };
  var geometry, edgeMesh;

  return api;

  function draw(lines, color) {
    color = normalizeColor(color) || 0xffffff;

    var points = new Float32Array(lines);
    geometry = new THREE.BufferGeometry();

    var material = new THREE.LineBasicMaterial({
      color: color
    });

    geometry.addAttribute('position', new THREE.BufferAttribute(points, 3));

    if (edgeMesh) {
      scene.remove(edgeMesh);
    }

    edgeMesh = new THREE.Line(geometry, material, THREE.LinePieces);
    edgeMesh.frustumCulled = false;
    scene.add(edgeMesh);
  }
}
