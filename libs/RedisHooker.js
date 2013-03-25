var util = require('util'),
	redis = require('redis'),
	EventEmitter = require('events').EventEmitter;
    //redis = require('redis');


const RedisEmitter_events = new EventEmitter();
RedisEmitter_events.setMaxListeners(10000000)
RedisEmitter_events.on('error',function(e){
	console.log("RedisEmitter_events")
	console.log(e)
})
var RedisHooker = module.exports = function() {
	return this;
};

RedisHooker.prototype.getEmmiter = function (){
    return RedisEmitter_events;
}
RedisHooker.prototype.addUse = function(config) {
//	console.log("===========Message===========2");

	const subscribe = redis.createClient(config.redis.port,config.redis.host,config.redis.host.options || {});
    if (config.redis.password){
        subscribe.auth(config.redis.password,function(e){

        });
    }


	const version = config.jast.version || "1";
    const namespace = config.jast.namesapce || "jast";
    const listener = config.jast.namesapcelistener || "Feeds";
    const prefix = "/"+version+"/"+namespace+"/";
	
	
	subscribe.on("pmessage", function(pattern, channel, message) {
		//socket.emit('message', { channel: channel, data:  message });
		//console.log("=========================");
		//console.log("===========Message===========");
		//console.log(pattern);
		//console.log(channel);
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
	console.log("watch========>"+prefix+listener+":*")
	subscribe.psubscribe(prefix+listener+":*");
	  

};
RedisHooker.prototype.use = RedisHooker.prototype.addUse;
