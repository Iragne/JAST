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

var config = require("./conf.js"),
    env = require("./libs/env.js"),
	redis_emmitter = require("./libs/RedisEmitter.js"),
	express = require('express'),
    http = require('http'),
    RedisStore  = require('connect-redis')(express),
	app = express(),
	redis = require('redis'),
	database =  require('./libs/db.js'),
	poolers = require("./libs/pooler.js"),
	admin = require('./libs/apps.js'),
	jast_socket = require("./libs/jast_socket.js");



var DB = redis.createClient(config.redis.port,config.redis.host,config.redis.host.options || {});
DB.on("error", function (err) {
    "use strict";
    env.log.error("DB Error ");
    env.log.error(err);
});

if (config.redis.password){
    DB.auth(config.redis.password,function(e){
    });
}
var io = null;
var ns = null;

var start = function(cb){
    "use strict";
    //app.configure(function(){
        app.set('title', 'JAST API');
        app.use(express.compress());
        app.use(express.logger());
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(express.cookieParser());
        app.locals.self = true;

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

        env.log.info("JAST.js","fin Config apps");
    //});
    app.use(express.compress());
    //app.listen(config.express.port);


    redis_emmitter.use(config);

    console.log("JAST LISTEN ON ",config.express.port);
    var server = http.createServer(app).listen(config.express.port);
    admin.bind(app,DB);


    io = require('socket.io').listen(server);
    io.set('transports', ['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);
    io.set('log level', 2);
    //io.set('timeout', 0);
    io.enable('browser client minification');  // send minified client
    io.enable('browser client etag');          // apply etag caching logic based on version number
    io.enable('browser client gzip');          // gzip the file

    /*io.configure( function() {
    //    io.set('close timeout', 60*60*24); // 24h time out
    });*/
    ns = io.of("/"+config.express.websocket);

    var prefix = "/"+config.jast.version+"/"+config.jast.namespace+"/";

    DB.keys('/1/*',function(err,elts){
        env.log.info("clean redis");
        env.log.debug(elts);
        if(elts)
            for (var i = 0; i < elts.length; i++) {
                DB.del(elts[i]);
            }
    });


    database.Applications.findAll({}).success(function(apps){
        //env.log.error(apps);
        if (apps){
            for (var i in apps){
                var model = apps[i];
                DB.sadd(prefix+"Clients",model.ClientId);
                DB.sadd(prefix+"Apps",model.ClientId+":"+model.id);
                DB.sadd(prefix+"AppsKey",model.ClientId+":"+model.id+":"+model.secretkey);
            }
        }
    });

    database.Applications.find({where:{ClientId:1}}).success(function(app){
        DB.sadd(prefix+"Channels",1+":"+1+":"+"admin_channel");
        DB.sadd(prefix+"AppsKey",1+":"+1+":"+app.secretkey);
        jast_socket.runsio(DB,redis_emmitter,app.secretkey,ns,function(){
            poolers.run({key_admin: app.secretkey,client_admin:1,app_admin:app.id});
        });
    });
    cb(app);
};








if (module.parent) {
    module.exports.start = function(cb){
        database.run(function(){
            "use strict";
            console.log(config.express.port);
            start(cb);
        });
    };
}else{
    database.run(function(){
        "use strict";
        console.log(config.express.port);
        start(function (){
        });
    });
}


