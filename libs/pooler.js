var http = require("http"),
    diff_match_patch=require('jajsondiff'),
    EventEmitter = require('events').EventEmitter,
    crypto = require('crypto');
var urlparse = require('url');

//http://search.twitter.com/search.json?q=sex&rpp=5&include_entities=true&result_type=recent
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
//jsondiffpatch.config.diff_match_patch = require('./diff_match_patch_uncompressed.js');

// use text diff for strings longer than 5 chars 


///var d = jsondiffpatch.diff({ age: 5, name: 'Arturo' }, {age: 7, name: 'Armando' });

//console.log(d)










/*
var socket2 = require('socket.io-client').connect('http://localhost:4242/ns');
socket2.on('connect', function () {
//    console.log("********************************RRRR**************************************");
//    console.log("********************************RRRR**************************************");
    socket2.on('disconnect', function(){});
    socket2.on('message', function(data){
        //console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
        //console.log(data);
    });
    data = {client:1, key: key_admin, app:1,channel:"adelskott"};
    socket.emit('psubscribe', data,function (){
        console.log("ERROR SOCKET");
        //console.log(e);
    });
});

*/

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
exports.run = function(conf){
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
        socket_listen.on('message',function (datae){
            data = null;
            try{
                data = JSON.parse(datae)
            }catch(e){
                console.log(e)
            }
            console.log("Create POOLER url: "+data.url + " TTL: "+data.ttl + " c:"+data.clientid + " a:"+data.appid+" ch:"+data.channel)
//            console.log(datae)
            url = data.url;
            ttl = data.ttl;
            if (ttl < 2)
                ttl = 3;
            channel = data.channel;//crypto.createHash('sha1').update(url).digest('hex');
            clientid = data.clientid;
            appid = data.appid;
            keysecret = data.keysecret;
            var olddata = null;
            var olddata_json = null;
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
                        setTimeout(getRestData,ttl*1000);
                    });
                    
                    res.on("error",function (e) {
                        console.log("ERROR SOCKET");
                        console.log(e);
                        setTimeout(getRestData,ttl*1000);
                    });
                });
            };
            getRestData();
        });
        data = {client:client_admin, key: key_admin, app:app_admin,channel:"admin_channel"};
        socket_listen.emit('psubscribe', data,function (e){
            console.log(e)
        });
    });
}


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


var ssss = function (){
//    console.log("HOOOOOOOOOOOOOOHOOOOOOOOOOOOOOHOOOOOOOOOOOOOOHOOOOOOOOOOOOOOHOOOOOOOOOOOOOO")
    var socket2 = require('socket.io-client').connect('http://localhost:4242/ns',{'force new connection': true});
    socket2.on('error', function(e){
        console.log("error test")
        console.log(e)
    });
    socket2.on('connect', function () {
//        console.log("********************************RRRR**************************************");
    //    console.log("********************************RRRR**************************************");
        socket2.on('disconnect', function(){
            console.log("********************************dec**************************************");
        });
        socket2.on('message', function(data){
            console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
            //console.log(data);
        });
        key_admin = '8df9249e06236bdf5f625edd27c6613be2278fdd'
        var data = {client:1, key: key_admin, app:2,channel:"adelskott",url:"http://search.twitter.com/search.json?q=adelskott&rpp=5&include_entities=true&result_type=recent",ttl:3};
        //console.log(data)
        socket2.emit('psubscribe', data);
    });
}

setTimeout(ssss, 4000);
/*setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
setTimeout(ssss, 4000);
*/