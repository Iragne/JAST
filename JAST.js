var config = require("./conf.js"),
    env = require("./libs/env.js")
	redis_emmitter = require("./libs/RedisEmitter.js"),
	express = require('express'),
	app = express.createServer(),
	redis = require('redis'),
	database =  require('./libs/db.js'),
	RedisStore  = require('connect-redis')(express),
	poolers = require("./libs/pooler.js"),
	admin = require('./libs/apps.js'),
	jast_socket = require("./libs/jast_socket.js");



var DB = redis.createClient(config.redis.port,config.redis.host,config.redis.host.options || {});
DB.on("error", function (err) {
    env.log.error("DB Error ");
    env.log.error(err)
});

if (config.redis.password){
    DB.auth(config.redis.password,function(e){
        
    });
}
var io = null;
var ns = null;

var start = function(){

    app.configure(function(){
        app.set('title', 'JAST API');
        app.use(express.compress());
        app.use(express.logger());
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(express.cookieParser());
        
        
        app.use(express.static(__dirname + '/public'));
        app.set('view engine', 'jade');
        app.set('views', __dirname + '/views');
        //app.set('log level', 1);
        if(config.basicAuth)
            app.use(express.basicAuth(config.basicAuth.username, config.basicAuth.password));
        app.use(express.session({
            secret: config.sessionSecret || "12345",
            store:  new RedisStore({
                'host':   config.express.redis_store.host || "127.0.0.1",
                'port':   config.express.redis_store.port || 6379,
                'pass':   config.express.redis_store.password || "",
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
    
        env.log.info("JAST.js","fin Config apps")
    })
    app.use(express.compress());
    app.listen(config.express.port);
    
    admin.bind(app,DB);
    redis_emmitter.use(config);
    
    
    
    io = require('socket.io').listen(app);
    io.set('log level', 2);
    //io.set('timeout', 0);
    io.enable('browser client minification');  // send minified client
    io.enable('browser client etag');          // apply etag caching logic based on version number
    io.enable('browser client gzip');          // gzip the file

    io.configure( function() {
    //    io.set('close timeout', 60*60*24); // 24h time out
    });
    ns = io.of("/"+config.express.websocket);
    
    const prefix = "/"+config.jast.version+"/"+config.jast.namespace+"/";


    DB.keys('/1/*',function(err,elts){
        env.log.info("clean redis")
        env.log.debug(elts)
        if(elts)
            for (var i = 0; i < elts.length; i++) {
                DB.del(elts[i])
            };
        
    })
    

    database.Applications.findAll({}).success(function(apps){
        if (apps){
            for (i in apps){
                model = apps[i]
                DB.sadd(prefix+"Clients",model.ClientId);
                DB.sadd(prefix+"Apps",model.ClientId+":"+model.id);
                DB.sadd(prefix+"AppsKey",model.ClientId+":"+model.id+":"+model.secretkey);
            }
        }
        
    })

    database.Applications.find({where:{ClientId:1}}).success(function(app){
        DB.sadd(prefix+"Channels",1+":"+1+":"+"admin_channel");
        DB.sadd(prefix+"AppsKey",1+":"+1+":"+app.secretkey);
        jast_socket.runsio(DB,redis_emmitter,app.secretkey,ns,function(){
            poolers.run({key_admin: app.secretkey,client_admin:1,app_admin:app.id});        
        });
    });


};






database.run(function(){
    start();
})
