const Sequelize = require("sequelize");
const {database} = require("../sequelize");
const skeleton = require("./../skeletons/configuration");

const configuration = database.define(skeleton.name, skeleton.skeleton, skeleton.options);
/*
configuration.sync().then(function () {
    return configuration.create({
        name: 'test3'
    });
});
*/
module.exports = {
    configuration: configuration
};