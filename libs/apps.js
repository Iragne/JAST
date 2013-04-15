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

var	redis_req = require('redis'),
    database =  require('./db.js'),
    crypto = require('crypto'),
    applications = require('./controllers/applications.js'),
    channels = require('./controllers/channels.js'),
    users = require('./controllers/users.js'),
    poolers = require('./controllers/poolers.js'),
    redis = require('redis'),
    config = require("../conf.js"),
    env = require("./env.js");

module.exports.bind = function(app) {
    var DB = redis.createClient(config.redis.port,config.redis.host,config.redis.host.options || {});
    DB.on("error", function (err) {
        if (err){
            env.log.error("DB Error ");
            env.log.error(err)
        }
    });
    if (config.redis.password){
        DB.auth(config.redis.password,function(e){

        });
    }
	app.get("/*", function(req, res, next){
        if((typeof req.cookies['connect.sid'] === 'undefined' || !req.session.auth || req.session.auth.client == undefined) && req.path.indexOf("/admin/auth") == -1){
                return res.redirect('/admin/auth/login');
        }
		if (req.path != "/admin/auth/logout"  && req.path.indexOf("/admin/auth") > -1 &&  req.session.auth && req.session.auth.client){
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

