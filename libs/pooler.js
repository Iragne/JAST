var http = require("http"),
    diff_match_patch=require('jajsondiff'),
    EventEmitter = require('events').EventEmitter,
    crypto = require('crypto');
var urlparse = require('url');

var options = {
 hostname: "search.twitter.com",
 path: "/search.json?q=nodejs&rpp=5&include_entities=true&result_type=recent",
}
const RedisEmitter_events = new EventEmitter();

const dmp =new diff_match_patch.difftext();
const jsondiffpatch =  diff_match_patch.diffjson;
jsondiffpatch.config.textDiffMinLength = 5; 

RedisEmitter_events.setMaxListeners(10000000)

RedisEmitter_events.on("error",function(e){
    console.log("EvEmit");
    console.log(e);
}) 

var socket = null;
var channel_emmit = function (){
    
        if (socket == null)
            socket = require('socket.io-client').connect('http://localhost:4242/ns',{'force new connection': true});
        socket.on('error', function(e){
            console.log("error admin channel")
            console.log(e)
        });
        socket.on('connect', function () {
            console.log("admin channel connected");
            socket.on('disconnect', function(){
                console.log("disconenct admin channel")
            });
            RedisEmitter_events.on('pooler_message',function(data){
                console.log('pooler_message')
               // console.log(data)
                socket.emit('publish', data,function (){
                
               }); 
            });
        });
    
}
exports.run = function(conf,options){
//    return;    
    channel_emmit();
    var key_admin = conf.key_admin || '4dc31927dc719858c134d09b5941fe6db7ec6606';
    var client_admin = conf.client_admin || 1;
    var app_admin = conf.app_admin || 1;

    var socket_listen = require('socket.io-client').connect('http://localhost:4242/ns',{'force new connection': true});
    socket_listen.on('error', function(e){
            console.log("MY FINMY FINMY FINMY FINMY FINMY FINMY FIN")
    });
    socket_listen.on('connect', function () {
        console.log("Listen connected")
        socket_listen.on('disconnect', function(e){
            console.log("MY FINMY FINMY FINMY FINMY FINMY FINMY FIN")
        });
        socket_listen.on('killpoller',function (datae){
            console.log("Kill pooler "+datae.channel)
            RedisEmitter_events.emit(datae.channel,datae)
        });
        socket_listen.on('message',function (datae){
            data = null;
            try{
                data = JSON.parse(datae)
            }catch(e){
                console.log(e)
            }
            console.log(data)
            console.log("Create POOLER url: "+data.url + " TTL: "+data.ttl + " c:"+data.clientid + " a:"+data.appid+" ch:"+data.channel)
            
            var url = data.url;
            var ttl = data.ttl;
            if (ttl  == 0)
                ttl = 1;
            var channel = data.channel;//crypto.createHash('sha1').update(url).digest('hex');
            var clientid = data.clientid;
            var appid = data.appid;
            var keysecret = data.keysecret;
            var olddata = null;
            var olddata_json = null;
            var stop = false;
            

            var getRestData = function (){
                console.log("getdata "+url)
                var request = http.get(urlparse.parse(url), function(res){
                    var body = ''
                    res.setEncoding('binary');
                    res.on('data', function(chunk){body += chunk;});
                    res.on('end', function(){
                        if (body != olddata || olddata == null){
                            olddata = body;
                            RedisEmitter_events.emit('pooler_message',{client:clientid,
                                                                       key: keysecret,
                                                                       app:appid, 
                                                                       message:body,
                                                                       channel:channel});
                        }
                        if(!stop)
                            setTimeout(getRestData,ttl*1000);
                    });
                    
                    res.on("error",function (e) {
                        console.log("ERROR SOCKET");
                        console.log(e);
                        if(!stop)
                            setTimeout(getRestData,ttl*1000);
                    });
                });
            };
            getRestData();
            RedisEmitter_events.on("/1/jast/Feeds:"+clientid+":"+appid+":"+channel,function(){
                stop = true;
            })
        });
        data = {client:client_admin, key: key_admin, app:app_admin,channel:"admin_channel"};
        socket_listen.emit('psubscribe', data,function (e){
            console.log(e)
        });
    });
}

//jsondiffpatch.config.diff_match_patch = require('./diff_match_patch_uncompressed.js');

// use text diff for strings longer than 5 chars 


///var d = jsondiffpatch.diff({ age: 5, name: 'Arturo' }, {age: 7, name: 'Armando' });





/*


                if (body != olddata){

                        if (olddata){
                            var d = dmp.patch_make(body, olddata);
                            //var jsondiff = ''
        //                    console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
        //                    console.log(d)
                            try {
        //                        feeds = JSON.parse(body);
        //                        var diffj = jsondiffpatch.diff(olddata_json,feeds);
        //                        json_data2 = JSON.stringify(diffj);
        //                        console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
                                //json_data = JSON.stringify(d);
                                json_data = dmp.patch_toText(d) //d.toString()
        //                        if (json_data2.length < json_data.length){
        //                            json_data = json_data2;
        //                        }
        //                        console.log(json_data)
        //                        console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
                                //jsondiff = json_data;
                                
                                //clean = dmp.patch_apply(dmp.patch_fromText(json_data), olddata) 
        //                        console.log(clean[0])
        //                        console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
                            }catch(e){
                                console.log("My error stringify")
                                console.log(e)
                            }
        //                    console.log(json_data.length + " < "+body.length)
                            if (json_data.length < body.length){
                                console.log("diff sent")
                                olddata = body;
                                body = json_data
                            }
        //                    console.log(body);
                        }else{
                            olddata = body;
                            try{
                                feeds = JSON.parse(body);
                                olddata_json = feeds;
                            }catch(e){
                                console.log("My error stringify")
                                console.log(e)
                            }
                        }
                        
                        
*/


