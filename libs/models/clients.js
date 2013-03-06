var Sequelize = require('Sequelize');

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Clents', {
        name: Sequelize.STRING,
        description: Sequelize.TEXT,
        username: Sequelize.STRING,
        password: Sequelize.STRING,
        email: Sequelize.STRING
    });
}