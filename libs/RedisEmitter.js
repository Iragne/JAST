var util = require('util'),
    redis = require('redis'),
    RedisHooker = require('./RedisHooker.js');
   

var redish = new RedisHooker();
var redisinstance = null;

module.exports.use = function(config) {
	redish.use(config);
	redisinstance = redis.createClient(config.redis.port,config.redis.host,config.redis.host.options || {});
    redisinstance.on("error", function (err) {
        console.log("RedisEmitterSub " + err);
    });
    if (config.redis.password){
        console.log("add auth "+config.redis.password)
        redisinstance.auth(config.redis.password,function(e){
            if(e)
                throw e;
        });
    }
    console.log("create instance")
	
};

function RedisEmitterSub() {
	this._event = redish.getEmmiter();
};
RedisEmitterSub.prototype.subscribe = function(channel,prefix, callback) {
    var a = this;
    var countc = prefix+"ChannelsCounter"+channel;
    console.log("sub count ====> "+channel);
    redisinstance.exists(countc,function(e){
    	if (e)
    		redisinstance.incr(countc)
    	else
    		redisinstance.set(countc,1)
    });
    redisinstance.exists(channel,function(){
    	redisinstance.set(channel,1);
    })
	this._event.on(channel,function(datae){
		//console.log("============================================="+channel)
		//console.log(datae)
		try{
            //console.log("============================================="+channel)
			//redisinstance.set(channel,data);
			data = JSON.parse(datae)
    		a.callback(data.key,data.data)
		}catch(e){
			console.log(e)
		}
	});
	// bind to redis automatic because watching Feeds.*
};
RedisEmitterSub.prototype.unsubscribe = function(channel,prefix, callback) {
    var a = this;
    var countc = prefix+"ChannelsCounter"+channel;
    console.log("unsub ====> "+countc);	
    redisinstance.decr(countc,function(e){
    	redisinstance.get(countc,function(e){
    		if (e <= 0){
    			redisinstance.del(countc);
    			if(callback)
    				callback()
    		}
    			

    	})
    	
    });
	// bind to redis automatic because watching Feeds.*
};

RedisEmitterSub.prototype.callback = function(data){
    	console.log("Not not implemented")
}

RedisEmitterSub.prototype.on = function(event, callback) {
	if(typeof callback !== 'function') {
		throw new Error('RedisEmitterSub Invalid addListener callback');
	}
	if(event == "pmessage"){
		this.callback = callback;
	}
};
module.exports.createSubscribe = function(){ 
    return new RedisEmitterSub()
};



function RedisEmitterPub() {
	
};
RedisEmitterPub.prototype.publish = function(channel,key, data) {
    try {
    	console.log("push data===========>")
    	var a = {key:key,data:data}
    	var d = JSON.stringify(a);
    	//console.log(d)
    	redisinstance.set(channel, d)
        redisinstance.publish(channel, d);
    }catch(e){
        console.log("NNNNNNNNNNNNN errr")
        console.log(e)
    }	
};
module.exports.createPublish = function(){ 
	return new RedisEmitterPub()
};











