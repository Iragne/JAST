var util = require('util'),
	EventEmitter = require('events').EventEmitter,
    redis = require('redis');


const RedisEmitter_events = new EventEmitter();
RedisEmitter_events.setMaxListeners(10000000)
var RedisHooker = module.exports = function() {
	return this;
};

RedisHooker.prototype.getEmmiter = function (){
    return RedisEmitter_events;
}
RedisHooker.prototype.addUse = function(redis,options) {
//	console.log("===========Message===========2");
	const subscribe = redis.createClient();
	
	
	
	const version = options.version || "1";
	const namespace = options.namesapce || "Feeds";
	
	
	subscribe.psubscribe("/"+version+"/"+namespace+":*");
	subscribe.on("pmessage", function(pattern, channel, message) {
		//socket.emit('message', { channel: channel, data:  message });
//		console.log("=========================");
//		console.log("===========Message===========");
//		console.log(pattern);
//		console.log(channel);
//		console.log(message);
/*		var feeds = null;

		try{
            feeds = JSON.parse(message);
        }catch(e){
            console.log("========================= ERROR RECIVE INFO");
            console.log(e)
        }
*/
            
		//console.log(message);
		//console.log("=========================");
		
		RedisEmitter_events.emit(channel,message);
		
		// send to dispatcher
	});
	  

};
RedisHooker.prototype.use = RedisHooker.prototype.addUse;
