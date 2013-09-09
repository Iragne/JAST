var http = require('http');
var assert = require("assert");
var should = require('should');
var utils = require("../libs/utils.js");
var jast = require("./../../JAST.js");
var querystring = require('querystring');
var socketio = require('socket.io-client');
var database =  require('../../libs/db.js');
var config = require("../../conf.js");

var port = 4242;

var app = null;
var sessionCookie = null;


var socket = null;
var channel_emmit = function (){
        "use strict";
        
};

var key_admin = "";

describe('JAST', function(){
	describe('API socket', function(){
		before(function (done){
			database.Applications.find({where:{ClientId:1}}).success(function(app){
				key_admin = app.secretkey;
				done();
			});
		});
		it("should connect and brodcast message",function (done){
			var url = 'http://'+config.poolers.server+':'+config.express.port+'/'+config.express.websocket;
			if (socket === null)
				socket = socketio.connect(url,{'force new connection': true});
			socket.on('error', function(e){
				done(e);
			});
			socket.on('connect', function () {
				socket.on('disconnect', function(){
					done("disconnect");
				});
			});
			socket.on('message', function(data){
				console.log(data);
				done();
			});

			var data = {client:1, key: key_admin, app:1,channel:"test-marseille"};
			var data2 = {client:1, key: key_admin, app:1,channel:"test-marseille",message:{ok:1}};
			socket.emit('psubscribe', data);
			socket.emit('publish', data2);
		});
	});
});