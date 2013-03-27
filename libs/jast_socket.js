var Mutex = require('mutex'),
    crypto = require('crypto'),
    redis = require('redis'),
    config = require("../conf.js");


var redis_mutex = redis.createClient(config.redis.port,config.redis.host,config.redis.host.options || {});
redis_mutex.on("error", function (err) {
    console.log("redis_mutex " + err);
});
if (config.redis.password){
    redis_mutex.auth(config.redis.password,function(e){
        console.log(e)
        if (e)
        throw e;
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

    

    console.log("runsio")
    ns.on('connection', function(socket) {
        console.log("connection recived");
        //console.log(socket)
    	var subscribe = null;
    	var publish = null;
        
        var publishp = null;

        var clientid = null;
        var appid = null;
        var appkey = null;

        var channels = [];

    	socket.on('disconnect',function (){
        	console.log("disconnect JAAJA ***********");
            if (subscribe && channels.length){
                for (var i = 0; i < channels.length; i++) {
                    var channel = channels[i].channel;
                    subscribe.unsubscribe(channel,prefix,function(){
                        // plus de subscriber au channel
                        // kill pooler du channel
                        var clientapppooler = channel;
                        clientapppooler = clientapppooler.replace(prefix+listener,prefix+"Poolers")
                        //clientapppooler.replace(clientapppooler,)prefix+listener+":"+clientid+':'+appid+':'
                        console.log("kill JAJAJAJJ =>  "+clientapppooler)
                        DB.del(clientapppooler)
                        console.log("kill JAJAJAJJ =>  "+channel)
                        DB.get(clientapppooler,function(e){
                            // keyurlclient = prefix+"Poolers:"+clientid+':'+appid+':'+crypto.createHash('sha1').update(url).digest('hex');
                            var m = {
                                clientid: clientid,
                                appid:appid,
                                channel:channel
                            };
                            redis_emmitter.createPublish().publish(admin_channel,"killpooler",m);

                        })
                    });
                };
            }
    	});
    	socket.on('publish', function(data,fct) {
            if (!checkdata(socket,data,clientid,appkey))
                return;
        	console.log("publish")
        	//console.log(data)
            if(!appkey)
        	   appkey = data.key;
        	if (!clientid)
                clientid = data.client;
            if(!appid)
        	   appid = data.app;
        	
            var channel = data.channel;
//        	var ch = clientid+":"+appid+":"+channel;
            var ch = prefix+listener+":"+clientid+":"+appid+":"+channel;
            var AppsKey = clientid+":"+appid+":"+appkey;
        	//check clients and key
        	
        	DB.sismember(prefix+'AppsKey', AppsKey, function(err, datar) {
            	if (datar){
                    if (publish == null){
                        publish = redis_emmitter.createPublish()
                    }
                    publish.publish(ch, "message",data.message);
//                        console.log("=@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
        	   }else{
                    console.log("No key for the client found: "+clientid+":"+appkey);
                    // close all
                }
                
        	});
    		fct(0,'ok');
    	});
    	
        socket.on('usubscribe', function(data) {

            if (!checkdata(socket,data,clientid,appkey))
                return;
            
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
            subscribe.unsubscribe(ch,prefix,function(){
                // call del pooler
                DB.get(clientapppooler,function(e){
                    var m = {
                        clientid: clientid,
                        appid:appid,
                        channel:channel
                    };
                    redis_emmitter.createPublish(admin_channel,"killpooler",m);
                })
            });
        });
    	
    	socket.on('psubscribe', function(datae) {
            if (!checkdata(socket,datae,clientid,appkey))
                return;
    	    console.log('psubscribe');
    	    //console.log(datae);

            if(!appkey)
               appkey = datae.key;
            if (!clientid)
                clientid = datae.client;
            if(!appid)
               appid = datae.app;

        	var url = datae.url;
        	var ttl = datae.ttl;
            var keyurlclient = null;
            if (url){
                urlk = crypto.createHash('sha1').update(url).digest('hex');
                keyurlclient = "Poolers:"+clientid+':'+urlk;
                datae.channel = urlk;
            }
            var channel = null;
        	if (datae.channel)
                channel = datae.channel;

        	console.log("Subscribe to c:"+channel+" a:"+appid+" cl:"+clientid);
            
        	var ch = prefix+listener+":"+clientid+":"+appid+":"+channel;
        	
            var clientAndKey = clientid+":"+appid+":"+appkey;
            
//            console.log("--------------------------------------------=====dd");
            DB.sismember(prefix+'AppsKey', clientAndKey, function(err, data) {
            	if (data){
            	    if (subscribe == null){
            	        console.log("create sub")
                	    subscribe =redis_emmitter.createSubscribe(ch)
            	    }
                    //console.log(ch)
                    channels.push({channel:ch})
                	
                	subscribe.on("pmessage", function(key,pmessage) {
//                      		console.log("--------------------------------------------=====aaa");
//                        		console.log(pmessage);
                            //console.log(key)
                    		socket.emit(key, pmessage);
                    });
                    subscribe.subscribe(ch,prefix);
                    //console.log("qsDQUDFYGIUQohiofhuisqgfhugiuqsgfugsduigqiusdfi")
            	}else{
                    console.log("No key for the client found here : " + clientAndKey + " channel send " + channel);
                    // close all
                }
        	});
            
            
        	
        	if (url){
        	    console.log("url found")
            	// ask for create poolers
            	var keyurlclient = prefix+"Poolers:"+clientid+':'+appid+':'+crypto.createHash('sha1').update(url).digest('hex');
                var clientapppooler = prefix+"Poolers:"+clientid+':'+appid+':'+channel;
            	var m = {url: url,
                            ttl: ttl,
                        	clientid: clientid,
                        	appid:appid,
                        	keysecret:appkey,
                        	channel:channel
                        	
                           };
                           
                var m = JSON.stringify(m)

                console.log("Mutex")
                //return;
                mutex.isolateCondRetry(keyurlclient, 100000000, function check(callback) {
                    console.log("GOTO MUTEX")
                    callback(null, mutex.continue);
                }, function isolated(callback){
                    // check si pooler 
                    console.log("check si pooler ")
                    DB.exists(keyurlclient, function(err, data) {
                        if (data){
                            // inc le nb de pooler
                           DB.incr(keyurlclient,function(){});
                           //check si un flux de pooler
                           DB.get(prefix+listener+":"+clientid+":"+appid+":"+channel,function (err,elt){
    //                         console.log(elt)
                               if (elt){
                                   console.log("VERSION DU FEEDS")
                                   socket.emit('message', elt);
                               }else{
                                   console.log("PAS DE VERSION DU FEEDS")
                                   // create pooler
                                   publishp = redis_emmitter.createPublish(admin_channel,"message",m);
                               }
                               callback(null,"pooler exist")
                           })
                        }else{
                           // create pooler log
                            DB.set(keyurlclient, 1, function(elt) {
                                // send data to admin
                                console.log("push direct redis to "+ admin_channel)
                                publishp = redis_emmitter.createPublish();
                                publishp.publish(admin_channel,"message",m); 
                                DB.set(clientapppooler, 1, function(elt) {
                                    callback(null,"pooler create")
                                }); 
                            });
                            // define the pooler id
                            
                        }
                        //console.log(m)
                    })
                    //console.log(m)
                    
                }, function after(err, result) {
                    console.log(result); 
                })
/*
            	DB.sismember('Poolers', client+':'+keyurl, function(err, data) {
                	if (data){
//                	   console.log("/"+version+"/Feeds:"+client+":"+app+":"+channel)
                	   DB.get("/"+version+"/Feeds:"+client+":"+app+":"+channel,function (err,elt){
//                	       console.log(elt)
                	       if (elt){
                	           console.log("VERSION DU FEEDS")
                	           socket.emit('message', elt);
                	       }else{
                    	       console.log("PAS DE VERSION DU FEEDS")
                    	       publishp = redis_emmitter.createPublish("/"+version+"/Feeds:1:1:admin_channel",m);
                	       }
                	   })
                	}else{
                    	DB.sadd('Poolers', client+':'+keyurl, function(elt) {
                        	
                    	})
                        publishp = redis_emmitter.createPublish("/"+version+"/Feeds:1:1:admin_channel",m);
                	}



            	});*/
        	}
        	
        });
    });
    next();
}