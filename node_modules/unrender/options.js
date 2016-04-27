module.exports = combineOptions;

var normalizeColor = require('./lib/normalize-color.js');

function combineOptions(options) {
  options = options || Object.create(null);

  var clearColor = normalizeColor(options.clearColor);

  /**
   * Background of the scene in hexadecimal form. Default value is 0x000000 (black);
   */
  options.clearColor = clearColor === 'number' ? clearColor : 0x000000;

  return options;
}
