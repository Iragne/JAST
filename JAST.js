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
	jast_socket = require("./libs/jast_socket.js");


var options = {version:"1",namespace:"Feeds"};

var DB = redis.createClient();
var io = null;
var ns = null;

var start = function(){

    app.configure(function(){
        app.set('title', 'JAST API');
        app.use(express.logger());
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(express.cookieParser());
        
        
        app.use(express.static(__dirname + '/public'));
        app.set('view engine', 'jade');
        app.set('views', __dirname + '/views');
        app.set('log level', 1);
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
        app.use(function(req, res, next) {
             res.on('error', function(e) {
               return console.log('Catching an error in the response ' + e.toString());
             });
             return next();
         });
        app.use(app.router);
    
        console.log("fin Config apps")
    })
    app.use(express.compress());
    app.listen(PORT);
    
    admin.bind(app,options);
    redis_emmitter.use(redis,options);
    
    
    
    io = require('socket.io').listen(app);
    io.set('log level', 1);
    //io.set('timeout', 0);
    io.configure( function() {
    //    io.set('close timeout', 60*60*24); // 24h time out
    });
    ns = io.of('/ns');
    
    database.Applications.find({where:{ClientId:1}}).success(function(app){
        DB.sadd("Channels",1+":"+1+":"+"admin_channel");
        DB.sadd("AppsKey",1+":"+1+":"+app.secretkey);
        jast_socket.runsio(DB,redis_emmitter,app.secretkey,ns,options,function(){
            poolers.run({key_admin: app.secretkey,client_admin:1,app_admin:app.id});        
        });
    });    
};






database.run(DB,function(){
    start();
})
