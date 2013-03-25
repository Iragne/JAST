var nconf = require('nconf');

//nconf.argv().env().file({ file: 'config.json' });

//exports.port = nconf.get("port") || 4242;
//exports.host = nconf.get("host") || "127.0.0.1";
/*exports.ttl_ping = nconf.get("ttl_ping") || 25000;
exports.timeout_nop = nconf.get("timeout_nop") || 40000;
exports.timeout_connexion = nconf.get("timeout_connexion") || 15000;
exports.feed_domain = nconf.get("feed_domain");
exports.feed_port = nconf.get("feed_port") || 80;
exports.feed_path = nconf.get("feed_path");
exports.frequencereload = nconf.get("frequencereload") || 3000;
exports.event_emitter_port = nconf.get("event_emitter_port");
exports.event_emitter_listen = nconf.get("event_emitter_listen") || "127.0.0.1";
exports.cluster_pidfiles = nconf.get("cluster_pidfiles") || "pids/";
exports.cluster_pidfiles_prefix = nconf.get("cluster_pidfiles_prefix") || "";
exports.log_directory = nconf.get("log_directory");
exports.log_level = nconf.get("log_level") || "debug";

*/

module.exports = {
	redis:{
		"host" : "127.0.0.1",
		"port" : 6379,
		"password" : "password"
	},
	express:{
		redis_store:{
			"host" : "127.0.0.1",
			"port" : 6379,
			"password" : "password"
		},
		port:"80",
		websocket:"ns"
	},
	mysql:{
		host : "127.0.0.1",
		port : 3307,
		username:"jast",
		password : "jastpassword",
		database:"jast"
	},
	poolers:{
		server:"localhost"
	},
	jast:{
		version:"1",
		namespace:"jast",
		namesapcelistener:"Feeds",
		secretkey:"jast be fast"
	}
	/*
		basicAuth:{
			username:"admin",
			password:"password"
		}
	*/
};