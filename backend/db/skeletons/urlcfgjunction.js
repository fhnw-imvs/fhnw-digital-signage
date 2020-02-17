const Sequelize = require("sequelize");
//const { configuration } = require("./../models/configuration");

module.exports = {
    name: 'urlcfgjunction',
    skeleton: {
        id: {
            type: Sequelize.INTEGER,
            unique: true,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        urlId: {
            type: Sequelize.INTEGER,
        },
        configurationId: {
            type: Sequelize.INTEGER,
        },
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: new Date()
        },
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: new Date()
        }
    },
    options: {
        freezeTableName: true // Model tableName will be the same as the model name
    }
};