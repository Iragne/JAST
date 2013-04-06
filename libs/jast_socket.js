var Mutex = require('mutex'),
    crypto = require('crypto'),
    redis = require('redis'),
    env = require("./env.js"),
    config = require("../conf.js");


var redis_mutex = redis.createClient(config.redis.port,config.redis.host,config.redis.host.options || {});
redis_mutex.on("error", function (err) {
    env.log.error("FILE:jast_socket.js","redis_mutex " + err);
});
if (config.redis.password){
    redis_mutex.auth(config.redis.password,function(e){
        if (e){
            env.log.error(e)
            throw e;
        }
    });
}
var mutex = new Mutex({redis:redis_mutex,pass:config.redis.password});

var checkdata = function(socket,data,clientid,appkey){
    var key = data.key;
    var client = data.client;
    if (clientid != null && appkey != null && (clientid != client || key != appkey)){
        socket.close();
        return false;
    }
    return true;
}        

module.exports.runsio = function (DB,redis_emmitter,t_admin_key,ns,next){
    const version = config.jast.version || "1";
    const namespace = config.jast.namesapce || "jast";
    const listener = config.jast.namesapcelistener || "Feeds";
    const prefix = "/"+version+"/"+namespace+"/";
    const admin_channel = prefix+listener+":1:1:admin_channel";

        

    env.log.debug("FILE:jast_socket.js","JAST SOCKET IO")
    ns.on('connection', function(socket) {
        env.log.debug("FILE:jast_socket.js","connection recived ip:"+socket.handshake.address.address);
    	var subscribe = null;
    	var publish = null;
        
        var publishp = null;

        var clientid = null;
        var appid = null;
        var appkey = null;

        var channels = [];

    	socket.on('disconnect',function (){
            if (subscribe && channels.length){
                for (var i = 0; i < channels.length; i++) {
                    var channel = channels[i].channel;
                    subscribe.unsubscribe(channel,prefix,function(){
                        // plus de subscriber au channel
                        // kill pooler du channel
                        var clientapppooler = channel;
                        clientapppooler = clientapppooler.replace(prefix+listener,prefix+"Poolers")
                        //clientapppooler.replace(clientapppooler,)prefix+listener+":"+clientid+':'+appid+':'
                        DB.del(clientapppooler)
                        DB.get(clientapppooler,function(err,e){
                            // keyurlclient = prefix+"Poolers:"+clientid+':'+appid+':'+crypto.createHash('sha1').update(url).digest('hex');
                            var m = {
                                clientid: clientid,
                                appid:appid,
                                channel:channel
                            };
                            redis_emmitter.createPublish().publish(admin_channel,"killpooler",channel,m);

                        })
                    });
                };
            }
    	});
    	socket.on('publish', function(data,fct) {
            if (!checkdata(socket,data,clientid,appkey))
                return;
        	env.log.debug("FILE:jast_socket.js","publish "+ socket.handshake.address.address)
            if(!appkey)
        	   appkey = data.key;
        	if (!clientid)
                clientid = data.client;
            if(!appid)
        	   appid = data.app;
        	
            var channel = data.channel;
            var ch = prefix+listener+":"+clientid+":"+appid+":"+channel;
            var AppsKey = clientid+":"+appid+":"+appkey;
        	//check clients and key
        	
        	DB.sismember(prefix+'AppsKey', AppsKey, function(err, datar) {
            	if (datar){
                    if (publish == null){
                        publish = redis_emmitter.createPublish()
                    }
                    publish.publish(ch, "message",channel,data.message);
        	   }else{
                    env.log.error("FILE:jast_socket.js","No key for the client found: "+clientid+":"+appkey);
                    // close all
                }
                
        	});
            if(fct)
    		  fct(0,'ok');
    	});
    	
        socket.on('usubscribe', function(data) {

            if (!checkdata(socket,data,clientid,appkey))
                return;
            env.log.debug("FILE:jast_socket.js","unsubscribe " + socket.handshake.address.address)
            var url = data.url;
            var keyurlclient = null;
            if (url){
                keyurlclient = "Poolers:"+clientid+':'+crypto.createHash('sha1').update(url).digest('hex');
                data.channel = keyurlclient;
            }
            var channel = null;
            if (datae.channel)
                channel = datae.channel;
            var ch = prefix+listener+":"+clientid+":"+appid+":"+channel;
            var clientapppooler = prefix+"Poolers:"+clientid+':'+appid+':'+channel;
            //var keyurlclient = prefix+"Poolers:"+clientid+':'+appid+':'+channel;
            subscribe.unsubscribe(ch,prefix,function(){
                // call del pooler
                // mutex(clientapppooler)
                // dec 
                // si dec == 0
                DB.get(clientapppooler,function(err,e){
                    var m = {
                        clientid: clientid,
                        appid:appid,
                        channel:channel
                    };
                    redis_emmitter.createPublish().publish(admin_channel,"killpooler",channel,m);
                })
            });
        });
    	
    	socket.on('psubscribe', function(datae) {
            if (!checkdata(socket,datae,clientid,appkey))
                return;
    	    env.log.debug("FILE:jast_socket.js",'psubscribe '+ socket.handshake.address.address);

            if(!appkey)
               appkey = datae.key;
            if (!clientid)
                clientid = datae.client;
            if(!appid)
               appid = datae.app;

        	var url = datae.url;
        	var ttl = datae.ttl;
            var keyurlclient = null;
            var feed = datae.feed || 0;
            var diff = datae.diff || 0;

            if (url){
                urlk = crypto.createHash('sha1').update(url).digest('hex');
                keyurlclient = "Poolers:"+clientid+':'+urlk;
                datae.channel = urlk;
            }
            var channel = null;
        	if (datae.channel)
                channel = datae.channel;

        	env.log.info("FILE:jast_socket.js","Subscribe to c:"+channel+" a:"+appid+" cl:"+clientid);
        	var ch = prefix+listener+":"+clientid+":"+appid+":"+channel;
            var clientAndKey = clientid+":"+appid+":"+appkey;
            
            DB.sismember(prefix+'AppsKey', clientAndKey, function(err, data) {
            	if (data){
            	    if (subscribe == null){
            	        env.log.debug("FILE:jast_socket.js","create sub on channel: "+channel)
                	    subscribe =redis_emmitter.createSubscribe(ch)
            	    }
                    channels.push({channel:ch})
                	
                	subscribe.on("pmessage", function(key,channelclean,pmessage) {
                    		socket.emit(key, pmessage);
                    });


                    subscribe.subscribe(ch,prefix);
                    if (feed)
                        DB.get(ch,function (err,elt){
                           if (elt && elt != "1"){
                               try{
                                    socket.emit('message', elt);
                               }catch(e){

                               } 
                           }
                        })

            	}else{
                    env.log.error("FILE:jast_socket.js","No key for the client found here : " + clientAndKey + " channel send " + channel);
                    // close all
                }
        	});
        	if (url){
        	    env.log.debug("FILE:jast_socket.js","URL found :"+url)
            	// ask for create poolers
            	var keyurlclient = prefix+"Poolers:"+clientid+':'+appid+':'+crypto.createHash('sha1').update(url).digest('hex');
                //var clientapppooler = prefix+"Poolers:"+clientid+':'+appid+':'+channel;
            	var m = {url: url,
                            ttl: ttl,
                        	clientid: clientid,
                        	appid:appid,
                        	keysecret:appkey,
                        	channel:channel
                        	
                           };
                           
                var m = JSON.stringify(m)

                mutex.isolateCondRetry(keyurlclient, 100000000, function check(callback) {
                    callback(null, mutex.continue);
                }, function isolated(callback){
                    DB.exists(keyurlclient, function(err, data) {
                        if (data){
                            // inc le nb de pooler
                           //DB.incr(keyurlclient,function(){});
                           //check si un flux de pooler
                           var subpushch = prefix+listener+":"+clientid+":"+appid+":"+channel;
                           DB.get(subpushch,function (err,elt){
                               if (elt){
                                   if(elt != "1"){
                                       try{
                                            socket.emit('message', elt);
                                       }catch(e){

                                       } 
                                   }else{
                                        env.log.debug("FILE:jast_socket.js","Feeds exist but empty "+subpushch)
                                   }
                               }else{
                                   publishp = redis_emmitter.createPublish();
                                   publishp.publish(admin_channel,"message",channel,m); 
                               }
                               callback(null,"pooler exist")
                           })
                        }else{
                           // create pooler log
                            DB.set(keyurlclient, url, function(elt) {
                                // send data to admin
                                env.log.debug("FILE:jast_socket.js","push direct redis to "+ admin_channel)
                                publishp = redis_emmitter.createPublish();
                                publishp.publish(admin_channel,"message",channel,m); 
                                //DB.set(clientapppooler, 1, function(elt) {
                                    callback(null,"pooler create")
                                //}); 
                            });
                            // define the pooler id
                        }
                    })
                }, function after(err, result) {

                })

        	}
        	
        });
    });
    next();
}