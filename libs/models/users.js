var Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    var users = sequelize.define('User', {
        username: Sequelize.STRING,
        password: Sequelize.STRING,
        active: Sequelize.INTEGER, 
        email: {
            type: Sequelize.STRING,
            validate: {isEmail:true}
        }
    },{instanceMethods:{
        saveorupdate: function(cb){
            var data = this;
            var add = function (){
                console.log("insert");
                data.save().success(function (savedata){
                    cb(savedata.values);
                });
            };
            if (this.id){
                console.log("update");
                users.find(this.id).success(function(e){
                   if (e){
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
        }
    }});
    return users;
}