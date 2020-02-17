'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      () => {
        if(process.env.NODE_ENV === 'development')
          queryInterface.bulkDelete('registration', null, {});
      },
      queryInterface.bulkInsert('registration', [
        {
          registerkey: undefined //TODO: insert here desired PSK in production, a minimum length of 128 is recommended
        },
      ], {}),
    ]);
  },

  down: ((queryInterface, Sequelize) =>
      Promise.all([
        queryInterface.bulkDelete('registration', null, {}),
      ]))
};
