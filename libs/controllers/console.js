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

var crypto = require('crypto'),
    database =  require('../db.js'),
    config = require("../../conf.js");


module.exports = function (app,DB){
	"use strict";
	var version = config.jast.version || "1";
	var namespace = config.jast.namesapce || "jast";
	var listener = config.jast.namesapcelistener || "Feeds";
	var prefix = "/"+version+"/"+namespace+"/";


	app.get('/admin/console/:clientid', function (req, res) {
		var list_apps = [];
		database.Applications.findAll({where:{ClientId:req.session.auth.client}}).success(function(apps){
			list_apps = apps;
			res.render('console/index', {client_id:req.session.auth.client,list_apps:list_apps,session:req.session.auth});
        });
	});
};