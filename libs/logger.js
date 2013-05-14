//
// Copyright (c) 2013 Jean Alexandre Iragne (https://github.com/Iragne)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//



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

