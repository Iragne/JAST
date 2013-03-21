HOST = process.argv[2] || "127.0.0.1",
//HOST = "localhost",
PORT =  process.argv[3] || "4242";




var config = require("./conf.js"),
	logger = require("./libs/logger.js").setup(config),
	redis_emmitter = require("./libs/RedisEmitter.js"),
	express = require('express'),
	app = express.createServer(),
	redis = require('redis'),
	database =  require('./libs/db.js'),
	RedisStore  = require('connect-redis')(express),
	poolers = require("./libs/pooler.js"),
	admin = require('./libs/apps.js'),
	crypto = require('crypto');


var options = {version:"1",namespace:"Feeds"};


app.configure(function(){
    app.set('title', 'JAST API');
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    
    
    app.use(express.static(__dirname + '/public'));
    app.set('view engine', 'jade');
    app.set('views', __dirname + '/views');
    
    if(config.basicAuth)
        app.use(express.basicAuth(config.basicAuth.username, config.basicAuth.password));
    app.use(express.session({
        secret: config.sessionSecret || "12345",
        store:  new RedisStore({
            'host':   config.redis.host || "127.0.0.1",
            'port':   config.redis.port || 6379,
            'pass':   config.redis.password || "",
            'maxAge': 1209600000
        })
        
        
    }));
    app.use(app.router);


})

app.listen(PORT);

admin.bind(app,options);
redis_emmitter.use(redis,options);


//var publish = redis_emmitter.createPublish();

var DB = redis.createClient();
var io = require('socket.io').listen(app);
//io.set('timeout', 0);
io.configure( function() {
//    io.set('close timeout', 60*60*24); // 24h time out
});
var ns = io.of('/ns');


var runsio = function (t_admin_key,next){
    ns.on('connection', function(socket) {
        console.log("connection recived");
    	var subscribe = null;
    	var publish = null;
    	socket.on('disconnect',function (){
        	console.log("disconnect JAAJA ***********");
    	});
    	socket.on('publish', function(data,fct) {
        	console.log("publish")
        	console.log(data)
        	var key = data.key;
        	var client = data.client;
        	var app = data.app;
        	var channel = data.channel;
        	var ch = client+":"+app+":"+channel;
        	//check clients and key
        	var version = 1;
        	DB.sismember('AppsKey', client+":"+app+":"+key, function(err, datar) {
            	DB.sismember(ch, 1, function(err, ischannel) {
            	   if (ischannel){
                	   // incremente
            	   }else{
                	   DB.sadd(ch,1);  
            	   }
            	   if (datar){
            	       if (publish == null){
                	       publish = redis_emmitter.createPublish("/"+version+"/Feeds:"+ch,data.message)
            	       }else
    	            	   publish.publish("/"+version+"/Feeds:"+ch, data.message);
            	   }else{
                        //console.log("No key for the client found: "+client+":"+key);
                        // close all
                    }
                    
            	});
        	});
    		fct(0,'ok');
    	});
    	
    	
    	socket.on('psubscribe', function(datae) {
    	    console.log('psubscribe');
    	    console.log(datae);
    	    var key = datae.key;
        	var client = datae.client;
        	var app = datae.app;
        	var channel = datae.channel;
        	
        	var url = datae.url;
        	var ttl = datae.ttl;
        	
        	const version = options.version || "1";
        	const namespace = options.namesapce || "Feeds";
        	var ch = "/"+version+"/"+namespace+":"+client+":"+app+":"+channel;
        	
    //	   var ar = channel.split("|");
    	   //subscribe.subscribe(channel);
    	   var clientAndKey = client+":"+app+":"+key;
    //	   var ch = ar[1];
    
            
            console.log("--------------------------------------------=====dd");
                DB.sismember('AppsKey', clientAndKey, function(err, data) {
                	if (data){
                	    if (subscribe == null){
                    	    subscribe =redis_emmitter.createSubscribe()
                	    }
                    	subscribe.subscribe(ch);
                    	subscribe.on("pmessage", function(pmessage) {
                        		console.log("--------------------------------------------=====aaa");
                        		console.log(pmessage);
                        		socket.emit('message', pmessage);
                        	});
                	}else{
                        console.log("No key for the client found here : " + clientAndKey + " channel send " + channel);
                        // close all
                    }
            	});
            
            
        	
        	if (url){
            	// ask for create poolers
            	channel = crypto.createHash('sha1').update(url).digest('hex');
            	DB.sismember('Poolers', client+':'+t_admin_key, function(err, data) {
                	if (data && false){
                	   DB.smembers("/"+version+"/Feeds:1:1:admin_channel",function (e){
                	       console.log("=========dsfsdf")
                    	   console.log(e) 
                	   })
                	   /*
publishp = redis_emmitter.createPublish("/"+version+"/Feeds:1:1:admin_channel",({
                    	   key_admin: t_admin_key,
                    	   client_admin: 1,
                    	   app_admin: 1
                	   }).toString());
*/
                	}else{
                    	DB.sadd('Poolers', client+':'+t_admin_key, function(elt) {
                        	
                    	})
                	}
                	m = {url: url,
                        ttl: ttl,
                    	clientid: client,
                    	appid:app,
                    	keysecret:key
                    	
                	   };
                	   
                	   m = JSON.stringify(m)
                	   console.log(m)
                	publishp = redis_emmitter.createPublish("/"+version+"/Feeds:1:1:admin_channel",m);


            	});
        	}
        	
        });
    });
    next();
}


database.Applications.find({where:{ClientId:1}}).success(function(app){
    DB.sadd("Channels",1+":"+1+":"+"admin_channel");
    DB.sadd("AppsKey",1+":"+1+":"+app.secretkey);
    runsio(app.secretkey,function(){
        poolers.run({key_admin: app.secretkey,client_admin:1,app_admin:app.id});        
    });
});

