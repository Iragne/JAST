var Sequelize = require('Sequelize'),
        crypto = require('crypto');;

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
            if (!data.secretkey)
                data.secretkey = crypto.createHash('sha1').update((new Date().getTime())+'dsdqsfsgfsgdfs').digest('hex');
                
            var add = function (){
                console.log("insert");
                data.secret = crypto.createHash('sha1').update((new Date().getTime())+'dsdqsfsgfsgdfs').digest('hex');
                data.save().success(function (savedata){
                    cb(savedata.values);
                });
            };
            if (this.id){
                console.log("update");
                apps.find(this.id).success(function(e){
                   if (e){
                        //console.log(data);
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