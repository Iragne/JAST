var	redis_req = require('redis'),
    database =  require('./db.js'),
    crypto = require('crypto'),
    applications = require('./controllers/applications.js'),
    channels = require('./controllers/channels.js'),
    users = require('./controllers/users.js');

module.exports.bind = function(app,options) {
	var redis = options.redis || redis_req;
	var DB = redis.createClient();
    DB.on("error", function (err) {
        console.log("DB Error " + err);
    });
	
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
	users(app,redis_req,database,crypto,DB);
	
	channels(app,redis_req,database,crypto,DB);
	
	applications(app,redis_req,database,crypto,DB,options);
	
	
};

