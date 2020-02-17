const Sequelize = require("sequelize");

module.exports = {
    name: 'configuration',
    skeleton: {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false,
        },
        description: {
            type: Sequelize.STRING,
        },
        cycletime: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 5,
        },
        reloadtime: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 5,
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
        },
    },
    options: {
        freezeTableName: true // Model tableName will be the same as the model name
    }
};