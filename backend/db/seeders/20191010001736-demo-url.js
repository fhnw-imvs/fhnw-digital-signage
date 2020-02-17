'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.bulkInsert('url', [
        {
          url: 'www.testpagexyzrq.ctm',
          description: 'loremipsum3'
        },
      ], {}),
    ]);
  },

  down: ((queryInterface, Sequelize) =>
      Promise.all([
        queryInterface.bulkDelete('url', null, {}),
      ]))
};
