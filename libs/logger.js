var logger = require('log');
var fs = require('fs');


exports.setup = function(conf) {
  if (conf.log_directory) {
    return new logger(conf.log_level, fs.createWriteStream(conf.log_directory + "/log_" + process.pid + ".log", {'flags': 'a'}));
  }
  else {
    return new logger(conf.log_level);
  }
}