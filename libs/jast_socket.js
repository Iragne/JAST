var Mutex = require('mutex'),
    mutex = new Mutex(),
    crypto = require('crypto');

module.exports.runsio = function (DB,redis_emmitter,t_admin_key,ns,options,next){
    console.log("runsio")
    ns.on('connection', function(socket) {
        console.log("connection recived");
        //console.log(socket)
    	var subscribe = null;
    	var publish = null;
    	socket.on('disconnect',function (){
        	console.log("disconnect JAAJA ***********");
    	});
    	socket.on('publish', function(data,fct) {
        	console.log("publish")
        	//console.log(data)
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
            	       }
                        publish.publish("/"+version+"/Feeds:"+ch, data.message);
//                        console.log("=@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
            	   }else{
                        console.log("No key for the client found: "+client+":"+key);
                        // close all
                    }
                    
            	});
        	});
    		fct(0,'ok');
    	});
    	
    	
    	socket.on('psubscribe', function(datae) {
    	    console.log('psubscribe');
    	    //console.log(datae);
    	    var key = datae.key;
        	var client = datae.client;
        	var app = datae.app;
        	var channel = datae.channel;
        	
        	var url = datae.url;
        	var ttl = datae.ttl;
        	
        	console.log("Subscribe to c:"+channel+" a:"+app+" cl:"+client);
        	const version = options.version || "1";
        	const namespace = options.namesapce || "Feeds";
        	var ch = "/"+version+"/"+namespace+":"+client+":"+app+":"+channel;
        	
    //	   var ar = channel.split("|");
    	   //subscribe.subscribe(channel);
    	   var clientAndKey = client+":"+app+":"+key;
    //	   var ch = ar[1];
    
            
//            console.log("--------------------------------------------=====dd");
                DB.sismember('AppsKey', clientAndKey, function(err, data) {
                	if (data){
                	    if (subscribe == null){
                	        console.log("create sub")
                    	    subscribe =redis_emmitter.createSubscribe()
                	    }
//                	    console.log(ch)
                    	subscribe.subscribe(ch);
                    	subscribe.on("pmessage", function(pmessage) {
  //                      		console.log("--------------------------------------------=====aaa");
//                        		console.log(pmessage);
                        		socket.emit('message', pmessage);
                        	});
                	}else{
                        console.log("No key for the client found here : " + clientAndKey + " channel send " + channel);
                        // close all
                    }
            	});
            
            
        	
        	if (url){
        	    console.log("url found")
            	// ask for create poolers
            	keyurl = crypto.createHash('sha1').update(url).digest('hex');
            	var m = {url: url,
                            ttl: ttl,
                        	clientid: client,
                        	appid:app,
                        	keysecret:key,
                        	channel:channel
                        	
                           };
                           
                m = JSON.stringify(m)
               
                mutex.isolateCondRetry(keyurl, 10000, function check(callback) {
                	DB.sismember('Poolers', client+':'+keyurl, function(err, data) {
                    	if (data){
                    	   DB.get("/"+version+"/Feeds:"+client+":"+app+":"+channel,function (err,elt){
    //                	       console.log(elt)
                    	       if (elt){
                    	           console.log("VERSION DU FEEDS")
                    	           socket.emit('message', elt);
                    	       }else{
                        	       console.log("PAS DE VERSION DU FEEDS")
                        	       publishp = redis_emmitter.createPublish("/"+version+"/Feeds:1:1:admin_channel",m);
                    	       }
                    	       callback(null, 'cached')
                	       })
                    	}else{
                        	callback(null, mutex.continue);
                    	}
                    	//console.log(m)
                	})
                }, function isolated(callback){
                    console.log(m)
                    DB.sadd('Poolers', client+':'+keyurl, function(elt) {
                        callback(null, 'some result');
                        publishp = redis_emmitter.createPublish("/"+version+"/Feeds:1:1:admin_channel",m);
                    });
                    
                
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