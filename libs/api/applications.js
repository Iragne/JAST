//
// Copyright (c) 2013 Jean Alexandre Iragne (https://github.com/Iragne)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

var database =  require('../db.js'),
    crypto = require('crypto'),
    config = require("../../conf.js");

module.exports = function (app,DB){
    "use strict";
    var version = config.jast.version || "1";
    var namespace = config.jast.namesapce || "jast";
    var prefix = "/"+version+"/"+namespace+"/";

	app.get('/api/applications/del/:appid', function (req, res) {
        var appid = req.params.appid.replace(/\W/g, '');
        database.Applications.find(appid).success(function(app){
            if (app && appid != 1){
                app.destroy().success(function () {
                });
            }
            res.json({app:app});
        });
	});
    app.get('/api/applications/details/:appid', function (req, res) {
        var appid = req.params.appid.replace(/\W/g, '');
        database.Applications.find(appid).success(function(app){
            res.json({flux:app,session:req.session.auth});
        });
	});


	app.post('/api/applications/add', function (req, res) {
        var data = req.body.app;
        data.ClientId = req.session.auth.client;
        data.active = parseInt(data.active,10);
        database.Applications.build(data).saveorupdate(function(model){
            if (model.active == 1){
                DB.sadd(prefix+"Clients",model.ClientId);
                DB.sadd(prefix+"Apps",model.ClientId+":"+model.id);
                DB.sadd(prefix+"AppsKey",model.ClientId+":"+model.id+":"+model.secretkey);
                console.log("add",prefix+"AppsKey",model.ClientId+":"+model.id+":"+model.secretkey);
            }else{
                DB.srem(prefix+"Clients",model.ClientId);
                DB.srem(prefix+"Apps",model.ClientId+":"+model.id);
                DB.srem(prefix+"Apps:"+model.ClientId,model.id);
                DB.srem(prefix+"AppsKey",model.ClientId+":"+model.id+":"+model.secretkey);
                console.log("del",prefix+"AppsKey",model.ClientId+":"+model.id+":"+model.secretkey);
            }
            return res.json({flux:model});
        });
	});
	app.get('/api/applications/:client', function (req, res) {
		if (req.params.client){
			var client = req.params.client.replace(/\W/g, '');
			database.Applications.findAll({where:{ClientId:req.session.auth.client}}).success(function(apps){
				res.json({flux:apps,session:req.session.auth});
			});
		}
    });
};
