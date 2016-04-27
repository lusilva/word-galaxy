module.exports = normalizeColor;

function normalizeColor(color) {
  if (color === undefined) return color;
  var colorType = typeof color;
  if (colorType === 'number') return color;
  if (colorType === 'string') return parseStringColor(color);
  if (color.length === 3) return (color[0] << 16) | (color[1] << 8) | (color[2]);

  return undefined;
}

function parseStringColor(color) {
  if (color[0] === '#') {
    return Number.parseInt(color.substring(1), 16);
  }
  return Number.parseInt(color, 16);
}
