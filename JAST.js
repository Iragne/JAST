HOST = process.argv[2] || "127.0.0.1",
//HOST = "localhost",
PORT =  process.argv[3] || "4242";




var config = require("./conf.js"),
	logger = require("./libs/logger.js").setup(config),
	redis_emmitter = require("./libs/RedisEmitter.js"),
	express = require('express'),
	app = express.createServer(),
	io = require('socket.io').listen(app),
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




io.sockets.on('connection', function(socket) {
	var subscribe = redis_emmitter.createSubscribe();
	var publish = redis_emmitter.createPublish();
	
	socket.on('publish', function(channel, data) {
    	var key = data.key;
    	var client = data.client;
    	var app = data.app;
    	var ch = client+":"+app+":"+channel;
    	//check clients and key
    	
    	DB.sismember('AppsKey', client+":"+key, function(err, data) {
        	if (data)
        	   publish.publish(ch, data);
            else{
                console.log("No key for the client found: "+client+":"+key);
                // close all
            }
    	});
		
	});
	
	
	socket.on('psubscribe', function(channel) {
	   var ar = channel.split("|");
	   //subscribe.subscribe(channel);
	   var clientAndKey = ar[0];
	   var ch = ar[1];
	   DB.sismember('AppsKey', clientAndKey, function(err, data) {
        	if (data)
        	   subscribe.subscribe(ch);
            else{
                console.log("No key for the client found : " + clientAndKey) + " channel send " + channel;
                // close all
            }
    	});
	});
	
	subscribe.on("pmessage", function(pattern, channel, message) {
		console.log({ channel: channel, data:  message });
		socket.emit('message', { channel: channel, data:  message });
	});

});


