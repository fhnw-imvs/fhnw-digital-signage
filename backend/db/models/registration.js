const Sequelize = require("sequelize");
const { database } = require("../sequelize");
const skeleton = require('./../skeletons/registration');

const registration = database.define(skeleton.name, skeleton.skeleton, skeleton.options);
/*
registration.sync().then(function () {
    return registration.create({
        registerkey: 'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e'
    });
});
*/
module.exports = {
    registration
};