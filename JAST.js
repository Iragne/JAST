HOST = process.argv[2] || "127.0.0.1",
//HOST = "localhost",
PORT =  process.argv[3] || "4242";




var config = require("./conf.js"),
	logger = require("./libs/logger.js").setup(config),
	redis_emmitter = require("./libs/RedisEmitter.js"),
	express = require('express'),
	app = express.createServer(),
	redis = require('redis'),
	RedisStore  = require('connect-redis')(express),
	admin = require('./libs/apps.js');


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
var ns = io.of('/ns');
ns.on('connection', function(socket) {
    console.log("connection recived");
	var subscribe = null;
	var publish = null;
	socket.on('disconnect',function (){
    	console.log("disconnect JAAJA ***********");
	});
	socket.on('publish', function(data,fct) {

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
            	       publish = redis_emmitter.createPublish()
        	       }
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
	   
	    var key = datae.key;
    	var client = datae.client;
    	var app = datae.app;
    	var channel = datae.channel;
    	const version = options.version || "1";
    	const namespace = options.namesapce || "Feeds";
    	var ch = "/"+version+"/"+namespace+":"+client+":"+app+":"+channel;
    	
//	   var ar = channel.split("|");
	   //subscribe.subscribe(channel);
	   var clientAndKey = client+":"+app+":"+key;
//	   var ch = ar[1];
	   DB.sismember('AppsKey', clientAndKey, function(err, data) {
        	if (data){
        	    if (subscribe == null){
            	    subscribe =redis_emmitter.createSubscribe()
            	    subscribe.on("pmessage", function(pmessage) {
                		//console.log("--------------------------------------------=====");
                		//console.log(pmessage);
                		socket.emit('message', pmessage);
                	});
        	    }
            	subscribe.subscribe(ch);
        	}else{
                console.log("No key for the client found : " + clientAndKey + " channel send " + channel);
                // close all
            }
    	});
	});
	
	

});



var poolers = require("./libs/pooler.js");

poolers.run();
