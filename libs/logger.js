/*!
 * JAST logger
 * Copyright(c) 2013 adelskott <adelskott@gmail.com>
 * MIT Licensed
 */


/**
 * Log levels.
 */

var levels = [
    'error'
  , 'warn'
  , 'info'
  , 'debug'
];

/**
 * Colors for log levels.
 */

var colors = [
    31
  , 33
  , 36
  , 90
];

/**
 * Pads the nice output to the longest log level.
 */

function pad (str) {
  var max = 0;

  for (var i = 0, l = levels.length; i < l; i++)
    max = Math.max(max, levels[i].length);

  if (str.length < max)
    return str + new Array(max - str.length + 1).join(' ');

  return str;
};

/**
 * Logger (console).
 *
 * @api public
 */

var Logger = module.exports = function (opts) {
  this.opts = opts || {}
  this.colors = false !== opts.colors;
  this.level = opts.levellog|| 3;
  this.enabled = opts.enabled || true;
};

/**
 * Log method.
 *
 * @api public
 */

Logger.prototype.log = function (type) {
  var index = levels.indexOf(type);

  if (index > this.level || !this.enabled)
    return this;

  console.log.apply(
      console
    , [this.colors
        ? '   \033[' + colors[index] + 'm' + pad(type) + ' -\033[39m'
        : type + ':'
      ].concat(toArray(arguments).slice(1))
  );

  return this;
};

/**
 * Generate methods.
 */

levels.forEach(function (name) {
  Logger.prototype[name] = function () {
    this.log.apply(this, [name].concat(toArray(arguments)));
  };
});


function toArray(enu) {
	var arr = [];
	for (var i = 0, l = enu.length; i < l; i++)
		arr.push(enu[i]);
	return arr;
}

