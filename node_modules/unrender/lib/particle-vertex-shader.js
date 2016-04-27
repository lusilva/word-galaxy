module.exports = [
'attribute float size;',
'attribute vec4 customColor;',
'',
'varying vec4 vColor;',
'',
'void main() {',
'  vColor = customColor/255.0;',
'  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
'  gl_PointSize = size * ( 351.0 / length( mvPosition.xyz ) );',
'  gl_Position = projectionMatrix * mvPosition;',
'}'
].join('\n');
