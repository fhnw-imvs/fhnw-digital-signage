'use strict';
const skeleton = require('./../skeletons/registration');

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable(skeleton.name, skeleton.skeleton, skeleton.options),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('registration')
};