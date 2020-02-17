docker exec -i mgmtapp-node-container bash -c 'cd mgmt_app_server_backend ; npx sequelize-cli db:drop ; npx sequelize-cli db:create ; npx sequelize-cli db:migrate ; npx sequelize-cli db:seed:all'
