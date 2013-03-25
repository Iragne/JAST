var Sequelize = require('Sequelize'),
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
                data.secret = crypto.createHash('sha1').update((new Date().getTime())+config.jast.secretkey).digest('hex');
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