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

var Sequelize = require('sequelize'),
    crypto = require('crypto'),
    config = require("../../conf.js");

module.exports = function(sequelize, DataTypes) {
    var apps = sequelize.define('Application', {
        name: Sequelize.STRING,
        description: Sequelize.TEXT,
        bundle: Sequelize.STRING,
        secretkey: Sequelize.STRING,
        active: Sequelize.INTEGER
    },{instanceMethods:{
        saveorupdate: function(cb){
            var data = this;
            var add = function (){
                console.log("insert");
                data.secretkey = crypto.createHash('sha1').update((new Date().getTime())+config.jast.secretkey).digest('hex');
                data.save().success(function (savedata){
                    cb(savedata.values);
                });
            };
            if (this.id){
                console.log("update");
                apps.find(this.id).success(function(e){
                   if (e){
                        //console.log(data);
                        data.secretkey = e.secretkey;
                        if (!e.secretkey){
                            console.log("regeneration key")
                            data.secretkey = crypto.createHash('sha1').update((new Date().getTime())+config.jast.secretkey).digest('hex');
                        }
                        e.updateAttributes(data).success(function (){
                            cb(data);
                        });                
                   }
                }).error(function(){
                    add();
                });
            }else{
                add();
            }
            //cb(this);
        }
    }});
    
    return apps;
}