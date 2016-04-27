var THREE = require('three');
var defaultTexture = require('./particle-texture.js');
var vertexShader = require('./particle-vertex-shader.js');
var fragmentShader = require('./particle-fragment-shader.js');

module.exports = createParticleMaterial;

function createParticleMaterial() {
  var attributes = {
    size: {
      type: 'f',
      value: null
    },
    customColor: {
      type: 'c',
      value: null
    }
  };

  var uniforms = {
    color: {
      type: "c",
      value: new THREE.Color(0xffffff)
    },
    texture: {
      type: "t",
      value: THREE.ImageUtils.loadTexture(defaultTexture)
    }
  };

  var material =  new THREE.ShaderMaterial({
    uniforms: uniforms,
    attributes: attributes,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true
  });

  return material;
}
