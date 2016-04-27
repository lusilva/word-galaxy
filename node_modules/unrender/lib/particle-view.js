var THREE = require('three');

module.exports = particleView;

function particleView(scene) {
  var points, colors, sizes;
  var pointCloud, geometry;
  var particleMaterial = require('./particle-material.js')();

  var api = {
    initWithNewCoordinates: initWithNewCoordinates,
    coordinates: getOrSetCoordinates,
    sizes: getOrSetSizes,
    colors: getOrSetColors,
    getPointCloud: getPointCloud
  };

  return api;

  function getPointCloud() {
    return pointCloud;
  }

  function initWithNewCoordinates(newPoints) {
    setPoints(newPoints);
    // TODO: this should go away and replaced by explicit methods
    setColors();
    setSizes();

    geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.BufferAttribute(points, 3));
    geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 4));
    geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));

    if (pointCloud) {
      scene.remove(pointCloud);
    }

    pointCloud = new THREE.PointCloud(geometry, particleMaterial);
    scene.add(pointCloud);
  }

  function setColors() {
    var colorsLength = 4 * (points.length/3)
    colors = new Float32Array(colorsLength);

    for (var i = 0; i < colorsLength; i += 4) {
      colors[i] = 0xff;
      colors[i + 1] = 0xff;
      colors[i + 2] = 0xff;
      colors[i + 3] = 0xff;
    }
  }

  function setSizes() {
    sizes = new Float32Array(points.length / 3);
    for (var i = 0; i < sizes.length; ++i) {
      sizes[i] = 15;
    }
  }

  function setPoints(newPoints) {
    if (isFloat32Array(newPoints)) {
      points = newPoints;
    } else {
      // todo: error checking
      points = new Float32Array(newPoints);
    }
    if (points.length > 0 && (points.length % 3) !== 0) {
      throw new Error('Each particle is expected to have three coordinates');
    }
  }

  function getOrSetCoordinates(newValue) {
    if (newValue === undefined) {
      return points;
    }
    if (isFloat32Array(newValue) && newValue.length === points.length) {
      points = newValue;
      geometry.getAttribute('position').needsUpdate = true;
    } else {
      // TODO: Remove this artificial thing. You can be smarter than this.
      throw new Error('Coordinates expect Float32Array and the size should be the same as original');
    }
  }

  function getOrSetColors(newValue) {
    if (newValue === undefined) {
      return colors;
    }
    if (isFloat32Array(newValue) && newValue.length === colors.length) {
      colors = newValue;
      geometry.getAttribute('customColor').needsUpdate = true;
    } else {
      // TODO: Remove this artificial thing. You can be smarter than this.
      throw new Error('colors expect Float32Array and the size should be the same as original');
    }
  }

  function getOrSetSizes(newValue) {
    if (newValue === undefined) {
      return sizes;
    }
    if (isFloat32Array(newValue) && newValue.length === sizes.length) {
      sizes = newValue;
      geometry.getAttribute('size').needsUpdate = true;
    } else {
      // TODO: Remove this artificial thing. You can be smarter than this.
      throw new Error('Sizes expect Float32Array and the size should be the same as original');
    }
  }

  function isFloat32Array(obj) {
    return Object.prototype.toString.call(obj) === "[object Float32Array]";
  }
}
