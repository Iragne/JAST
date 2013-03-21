var	redis_req = require('redis'),
    database =  require('./db.js'),
    crypto = require('crypto');

module.exports.bind = function(app,options) {
	var redis = options.redis || redis_req;
	var publish = redis.createClient();
	var DB = redis.createClient();
	
	var login_action = function (login,passe,callback){
	   if (login == null || passe == null)
	       return callback(false,0);
        database.Users.find({ where: {username: login,password:crypto.createHash('sha1').update(passe).digest('hex')} }).success(function(user) {
            //console.log("ok");
            //console.log(user);
            callback(user != null,user);
        }).error(function (e){
            console.log("error");
            console.log(e);
            callback(false,0);
        });
		
	};

	app.get("/*", function(req, res, next){
    	//console.log(req);
    	if (req.path.indexOf("/admin/auth") > -1  ){
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
		passe = req.body.password.replace(/\W/g, '');
		login_action(login,passe,function (respond,user){
		    //console.log(user);
		    //console.log(respond);
		    if(respond){
		      req.session.auth = {client:user.ClientId,user:user};
		      res.redirect('/admin/apps/'+user.ClientId);
		    }else
		      res.render('auth/login', respond);
		});
		
	});
	app.get('/admin/auth/login', function (req, res) {
		login_action(null,null,function (respond){
			res.render('auth/login', respond);
		});
	});
	app.get('/admin/apps/del/:appid', function (req, res) {
    	var appid = req.params.appid.replace(/\W/g, '');
    	database.Applications.find(appid).success(function(app){
        	if (app && appid != 1){
            	app.destroy().success(function () {
            	});
        	}
        	res.redirect('/admin/apps/'+req.session.auth.client);
    	});
	});	
	
	app.get('/admin/auth/logout', function (req, res) {
		if (req.session)
		  req.session.destroy();
		return res.redirect('/admin/auth/login');
	});
	
	app.get('/admin/apps/channel/:appid', function (req, res) {
    	var appid = req.params.appid.replace(/\W/g, '');
    	database.Applications.find(appid).success(function(app){
        	key = app.ClientId+":"+app.id+':'+'*';
        	//console.log(key);
        	DB.keys(key, function(err, data) {
            	//console.log(data);
            	res.render('apps/channel', {flux:data,session:req.session.auth});
        	});
    	});
		//res.send('ok');
		//res.render('apps/add', {flux:app,session:req.session.auth});
	});
	
	app.get('/admin/apps/details/:appid', function (req, res) {
    	var appid = req.params.appid.replace(/\W/g, '');
    	database.Applications.find(appid).success(function(app){
        	res.render('apps/add', {flux:app,session:req.session.auth});
    	});
		
	});
	
	app.get('/admin/poolers/:client', function (req, res) {
    	var client = req.params.client.replace(/\W/g, '');
       	res.render('apps/poolers', {flux:null,session:req.session.auth});
	});
	
	app.post('/admin/apps/add', function (req, res) {
        var data = req.body.app;
        data.ClientId = req.session.auth.client;
        data.active = parseInt(data.active);
        //console.log(data);
        // save data
        database.Applications.build(data).saveorupdate(function(model){
//            console.log("mdoel");
//            console.log(model);
            if (model.active == 1){
                //console.log("fsdf");
                DB.sadd("Clients",model.ClientId);
                DB.sadd("Apps",model.ClientId+":"+model.id);
                DB.sadd("AppsKey",model.ClientId+":"+model.id+":"+model.secretkey);
            }else{
                DB.srem("Clients",model.ClientId);
                
                DB.srem("Apps",model.ClientId+":"+model.id);
                DB.srem("Apps:"+model.ClientId,model.id);
                
                DB.srem("AppsKey",model.ClientId+":"+model.id+":"+model.secretkey);
                //DB.sadd("AppsKey",model.ClientId+":"+model.id+":"+model.secretkey);
                //DB.sadd("AppsKey:"+client+":"+model.id+":"+model.secretkey,channel);
                
            }
            return res.redirect('/admin/apps/'+req.session.auth.client);
        });
	});
	
	app.get('/admin/apps/add', function (req, res) {
        res.render('apps/add', {flux:{},session:req.session.auth});
	});
	
	app.get('/admin/apps/:client', function (req, res) {
    	var client = req.params.client.replace(/\W/g, '');
    	
    	database.Applications.findAll({where:{ClientId:req.session.auth.client}}).success(function(apps){
    	   res.render('apps/list', {flux:apps,session:req.session.auth});
    	});
    	
		
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

