var util = require('util'),
    RedisHooker = require('./RedisHooker.js');
   

var redish = new RedisHooker();
var redisinstance = null;

module.exports.use = function(redis,options) {
	redish.use(redis,options);
	redisinstance = redis.createClient();
	redisinstance.on("error", function (err) {
        console.log("Error " + err);
    });
};

function RedisEmitterSub() {
	this._event = redish.getEmmiter();
};
RedisEmitterSub.prototype.subscribe = function(channel, callback) {
    var a = this;
	this._event.on(channel,function(data){
	    redisinstance.set(channel,data);
    	a.callback(data)
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
module.exports.createSubscribe = function(channel,data){ 
    return new RedisEmitterSub(channel,data)
};



function RedisEmitterPub(channel,data) {
	redisinstance.publish(channel, data);
	redisinstance.on("error",function(e){
		console.log("Error hook RedisEmitterPub")
		console.log(e)
	})
};
RedisEmitterPub.prototype.publish = function(channel, data) {
    try {
        redisinstance.publish(channel, data);
    }catch(e){
        console.log("NNNNNNNNNNNNN errr")
        console.log(e)
    }	
};
module.exports.createPublish = function(channel,data){ 
	return new RedisEmitterPub(channel,data)
};











