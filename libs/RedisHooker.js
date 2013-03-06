var util = require('util'),
	EventEmitter = require('events').EventEmitter,
    redis = require('redis');



var RedisHooker = module.exports = function() {
	return this;
};


RedisHooker.prototype.addUse = function(redis,options) {
	
	const subscribe = redis.createClient();
	const RedisEmitter_events = new EventEmitter();
	
	
	const version = options.version || "1";
	const namespace = options.namesapce || "Feeds";
	
	
	subscribe.psubscribe("/"+version+"/"+namespace+":*");
	subscribe.on("pmessage", function(pattern, channel, message) {
		//socket.emit('message', { channel: channel, data:  message });
		console.log("=========================");
		console.log("===========Message===========");
		console.log(pattern);
		console.log(channel);
		console.log(message);
		console.log("=========================");
		
		RedisEmitter_events.emit(channel,message);
		
		// send to dispatcher
	});
	  

};
RedisHooker.prototype.use = RedisHooker.prototype.addUse;
