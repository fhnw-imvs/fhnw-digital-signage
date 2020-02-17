'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
        /*
        new Promise(() => {
            //console.log(process.env);
            if (process.env.NODE_ENV === 'development') {
                console.log('devenv');
                queryInterface.bulkDelete('user', null, {});
            } else {
                console.log('prodenv');
            }
        }),*/
        queryInterface.bulkInsert('user', [
            {
              username: undefined,           //TODO: Change admin user seeding
              password: undefined             //TODO: Change admin password seeding
            },
        ], {}),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
        queryInterface.bulkDelete('user', null, {}),
    ]);
  }
};
