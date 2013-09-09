var http = require('http');
var assert = require("assert");
var should = require('should');
var utils = require("../libs/utils.js");
var jast = require("./../../JAST.js");
var querystring = require('querystring');


var port = 4242;

var app = null;
var sessionCookie = null;

describe('JAST', function(){
	describe('API', function(){
		before (function (done) {
			jast.start(function (ap){
				app = ap;
				done();
			});
		});
		it('should exist', function (done) {
			should.exist(app);
			done();
		});
		it('should be listening at localhost:4242 and redirect to login page', function (done) {
			var headers = utils.defaultGetOptions('/',port,sessionCookie);
			http.get(headers, function (res) {
				res.statusCode.should.eql(302);
				done();
			});
		});
		it('should be display login page', function (done){
			var headers = utils.defaultGetOptions('/admin/auth/login',port,sessionCookie);
			http.get(headers, function (res) {
				res.statusCode.should.eql(200);
				var body = "";
				res.on('data', function (d) {
					body += d.toString('utf8');
				});
				res.on("end",function(){
					body.should.match(/<\/html>/);
					body.should.match(/Email/);
					done();
				});
			});
		});
		it('should auth for admin',function (done){
			var q = querystring.stringify({
				login: "admin",
				password: "password"
			});
			var options = utils.defaultPostOptions('/admin/auth/login',port, q,sessionCookie);
			var req = http.request(options, function (res) {
				res.setEncoding('utf8');
				res.statusCode.should.eql(302);
				sessionCookie = res.headers['set-cookie'][0];
				sessionCookie.should.match(/connect.sid/);
				var body = "";
				res.on('data', function (d) {
					body += d.toString('utf8');
				});
				res.on("end",function(){
					body.should.not.match(/<\/html>/);
					body.should.not.match(/Email/);
					done();
				});
			});
			req.write(q);
			req.end();
		});

		it('should redirect connection',function (done){
			var headers = utils.defaultGetOptions('/',port,sessionCookie);
			http.get(headers, function (res) {
				res.statusCode.should.eql(302);
				res.headers.should.have.property("location");
				done();
			});
		});
	});
});