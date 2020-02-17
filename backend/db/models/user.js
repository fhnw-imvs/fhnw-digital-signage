const Sequelize = require("sequelize");
const { database } = require("../sequelize");
const crypto = require('crypto');
const skeleton = require('./../skeletons/user');

const user = database.define(skeleton.name, skeleton.skeleton, skeleton.options);

//create hooks here
const setSaltAndPassword = user => {
    user.generateSalt = () => crypto.randomBytes(16).toString('base64');
    user.encryptPassword = (plainText, salt) => crypto
        .createHash('RSA-SHA256')
        .update(plainText)
        .update(salt)
        .digest('hex');
    console.log("generate salt");
    if (user.changed('password')) {
        user.salt = user.generateSalt();
        user.password = user.encryptPassword(user.password, user.salt);
    }
};
user.beforeCreate(u => setSaltAndPassword(u));
user.beforeUpdate(u => setSaltAndPassword(u));

/* TODO add for login
user.prototype.correctPassword = function(enteredPassword) {
    return user.encryptPassword(enteredPassword, this.salt()) === this.password()
}
*/
/*
user.sync().then(() =>
    user.create({
        username: 'muster',
        password: 'plain'
    }));
*/
module.exports = {
    user
};