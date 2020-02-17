const Sequelize = require("sequelize");
//const { configuration } = require("./../models/configuration");

module.exports = {
    name: 'url',
    skeleton: {
        id: {
            type: Sequelize.INTEGER,
            unique: true,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        url: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        description: {
            type: Sequelize.STRING,
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