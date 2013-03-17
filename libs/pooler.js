var http = require("http"),
    diff_match_patch=require('jajsondiff'),
    EventEmitter = require('events').EventEmitter;

//http://search.twitter.com/search.json?q=sex&rpp=5&include_entities=true&result_type=recent
var options = {
 hostname: "search.twitter.com",
 path: "/search.json?q=nodejs&rpp=5&include_entities=true&result_type=recent",
}
const RedisEmitter_events = new EventEmitter();
const dmp =new diff_match_patch.difftext();
const jsondiffpatch =  diff_match_patch.diffjson;
 
 
//jsondiffpatch.config.diff_match_patch = require('./diff_match_patch_uncompressed.js');

// use text diff for strings longer than 5 chars 
jsondiffpatch.config.textDiffMinLength = 5;

var d = jsondiffpatch.diff({ age: 5, name: 'Arturo' }, {age: 7, name: 'Armando' });

console.log(d)

var socket = require('socket.io-client').connect('http://localhost:4242/ns');
socket.on('connect', function () {
    socket.on('disconnect', function(){});
    RedisEmitter_events.on('pooler_message',function(data){
        socket.emit('publish', data,function (){
        
        });
    });
});
var olddata = null;
var olddata_json = null;

var getRestData = exports.run = function (){
//    console.log("getRestData")
    var request = http.get(options, function(res){
//        console.log("get method")
        //      console.log(res)
        var body = ''
        res.setEncoding('binary');
        res.on('data', function(chunk){body += chunk;});
        res.on('end', function(){
            //var feeds = null;
            //console.log(body)
            /*try{
                feeds = JSON.parse(body);
            }catch(e){
                console.log("ERROR RECIVE INFO");
            }*/
            
            // send data
            if (body != olddata){
//                console.log("sent data")
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
                
                
                RedisEmitter_events.emit('pooler_message',{client:1, key: '4dc31927dc719858c134d09b5941fe6db7ec6606', app:1, message:body,channel:"adelskott"});                
            }
            
            
        
            setTimeout(getRestData,1000);
        });
        
        res.on("error",function (e) {
            console.log("ERROR SOCKET");
            console.log(e);
            setTimeout(getRestData,4000);
        });
    });
};




var socket2 = require('socket.io-client').connect('http://localhost:4242/ns');
socket2.on('connect', function () {
//    console.log("********************************RRRR**************************************");
//    console.log("********************************RRRR**************************************");
    socket2.on('disconnect', function(){});
    socket2.on('message', function(data){
        //console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
        //console.log(data);
    });
    data = {client:1, key: '4dc31927dc719858c134d09b5941fe6db7ec6606', app:1,channel:"adelskott"};
    socket.emit('psubscribe', data,function (){
        console.log("ERROR SOCKET");
        //console.log(e);
    });
});

