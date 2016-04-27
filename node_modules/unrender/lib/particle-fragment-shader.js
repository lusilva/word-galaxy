module.exports = [
'uniform vec3 color;',
'uniform sampler2D texture;',
'',
'varying vec4 vColor;',
'',
'void main() {',
'  vec4 tColor = texture2D( texture, gl_PointCoord );',
'  if (tColor.a < 0.5) discard;',
'  gl_FragColor = vec4( color * vColor.rgb, tColor.a * vColor.a );',
'}'
].join('\n');
