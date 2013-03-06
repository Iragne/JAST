var	redis_req = require('redis'),
    database =  require('./db.js'),
    crypto = require('crypto');

module.exports.bind = function(app,options) {
	var redis = options.redis || redis_req;
	var publish = redis.createClient();
	var DB = redis.createClient();
	
	var login_action = function (login,passe,callback){
	   if (login == null || passe == null)
	       return callback(false,1);
        database.Users.find({ where: {username: login,password:crypto.createHash('sha1').update(passe).digest('hex')} }).success(function(user) {
//            console.log(user);
            callback(true,user);
        }).error(function (e){
            console.log(e);
            callback(true,1);
        });
		
	};

	app.get("/*", function(req, res, next){
    	//console.log(req);
    	if (req.path.indexOf("/admin/auth") > -1){
        	next();
        	return;
    	}
        if(typeof req.cookies['connect.sid'] !== 'undefined'){
//            console.log("SESSION");
//            console.log(req.cookies['connect.sid']);
//            console.log(req.session);
            
            if (!req.session.auth || !req.session.auth.client)
                return res.redirect('/admin/auth/login');
            else
                next();
        }else{
            //return res.redirect('/admin/auth/login');
            // TBD ...
            next();
        }

    });
	
	app.post('/admin/auth/login', function (req, res) {
		login = req.body.login.replace(/\W/g, '');
		passe = req.body.passe.replace(/\W/g, '');
		login_action(login,passe,function (respond,user){
//		    console.log(user);
		    if(respond){
		      req.session.auth = {client:user.ClentId};
		      res.redirect('/admin/apps/'+user.ClentId);
		    }else
		      res.render('auth/login', respond);
		});
		
	});
	app.get('/admin/auth/login', function (req, res) {
		login_action(null,null,function (respond){
			res.render('auth/login', respond);
		});
	});
	
	app.get('/admin/apps/:client', function (req, res) {
    	var client = req.params.client.replace(/\W/g, '');
		res.render('apps/list', {flux:[{name:"Test Apps",id:1}]});
	});
	
	
	
	
	
	
	app.get('/tests/redis_publish/:client/:app/:channel', function (req, res) {
		
		var client = req.params.client.replace(/\W/g, '');
		var app = req.params.app.replace(/\W/g, '');
		var channel = req.params.channel.replace(/\W/g, '');
		
		DB.sismember('Clients', client, function(err, data) {
			if (!data){
				DB.sadd("Clients",client);
			}
			DB.sismember('Apps', client+":"+app, function(err, data) {	
				if (!data){
					DB.sadd("Apps",client+":"+app);
					DB.sadd("AppsKey",client+":"+app+":key");
				}
				DB.sismember('Channels', client+":"+app+":"+channel, function(err, data) {	
					if (!data){
						DB.sadd("Channels",client+":"+app+":"+channel);
					}
					
					// send msg tests 
					var data = {data:{flux:[],time:1234234}},
						version = "1",
						//publish = redis_emmitter.createPublish(),
						ch = "/"+version+"/Feeds:"+client+":"+app+":"+channel;
					publish.publish(ch, data);
					res.send(200);
				});
			});
		});
	});

};

