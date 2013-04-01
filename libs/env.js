var config = require("../conf.js"),
	Logger = require("./logger.js"),
	redis = require('redis');
	//database =  require('./db.js');
	


var env = module.exports = {
	database: null,
	log: new Logger(config.jast.log)
}

