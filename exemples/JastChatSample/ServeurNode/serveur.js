var express = require('express'),
	utls = require('../../../libs/utils_jast.js'),
	app = express.createServer();



app.configure(function(){
    app.set('title', 'CHAT');
    app.use(express.compress());
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    
    app.use(express.static(__dirname + '/public'));
    app.set('view engine', 'jade');
    app.set('views', __dirname + '/views');
    app.set('log level', 1);
    
    app.use(function(req, res, next) {
         res.on('error', function(e) {
           return console.log('Catching an error in the response ' + e.toString());
         });
         return next();
     });
    app.use(app.router);
})
app.use(express.compress());
app.listen(8080);
io = require('socket.io').listen(app);
	
	
var listPerson = ['admin'];


var url = 'http://jast-io.com/ns'
socket = require('socket.io-client').connect(url,{'force new connection': true});
socket.on('error', function(e){
    console.log(e)
});
socket.on('connect', function () {
    socket.on('disconnect', function(){

    });
});





app.get("/user/add/:login",function(req,res){
	var login = req.params.login.replace(/\W/g, '_');
	listPerson.contains(login,function(found,pos){
		found || listPerson.push(login)
		var data = {client:"1",
	                   key:"3e50a5a9efb652e9023af556eaa1ac074c0295c5",
	                   app:"3", 
	                   message:{flux:listPerson},
	                   channel:"peoplelist"}
		socket.emit('publish', data,function (){});
		res.send("{ok:1}");
	})
})

app.get("/user/list",function(req,res){
	res.send(JSON.stringify({flux:listPerson}));
})
	
	
