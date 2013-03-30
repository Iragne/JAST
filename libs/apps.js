var	redis_req = require('redis'),
    database =  require('./db.js'),
    crypto = require('crypto'),
    applications = require('./controllers/applications.js'),
    channels = require('./controllers/channels.js'),
    users = require('./controllers/users.js'),
    poolers = require('./controllers/poolers.js'),
    redis = require('redis'),
    config = require("../conf.js");

module.exports.bind = function(app) {
    var DB = redis.createClient(config.redis.port,config.redis.host,config.redis.host.options || {});
    DB.on("error", function (err) {
        console.log("DB Error " + err);
    });
    if (config.redis.password){
        DB.auth(config.redis.password,function(e){

        });
    }
	app.get("/*", function(req, res, next){
        if(typeof req.cookies['connect.sid'] !== 'undefined' && req.path.indexOf("/admin/auth") == -1){
            if (!req.session.auth || !req.session.auth.client)
                return res.redirect('/admin/auth/login');
        }
		if (req.path.indexOf("/admin/auth") > -1 &&  req.session.auth && req.session.auth.client){
        	return res.redirect('/admin/apps/'+req.session.auth.client);
    	}
        next();
    });
	app.get("/",function(req,res){
		if (req.session.auth && req.session.auth.client){
        	return res.redirect('/admin/apps/'+req.session.auth.client);
    	}
    	return res.redirect('/admin/auth/login');
	});
	users(app,DB);
	
	channels(app,DB);
	
	applications(app,DB);
	
	poolers(app,DB)
};

