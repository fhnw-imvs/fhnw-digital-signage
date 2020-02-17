#!/usr/bin/env bash
cd ..
docker container stop mgmtapp-mysql-container
docker container stop mgmtapp-node-container
#docker container stop mgmtapp-mysql-dev-container

if [[ "$(docker images -q mgmtapp-dev-mysql:1.0 2> /dev/null)" == "" ]]; then
  docker rmi mgmtapp-dev-mysql:1.0
  docker build --tag mgmtapp-dev-mysql:1.0 ./db/
fi

if [ $(docker inspect -f '{{.State.Status}}' "mgmtapp-mysql-dev-container") = "exited" ];
  then docker start mgmtapp-mysql-dev-container; sleep 20;
  else
    if [ $(docker inspect -f '{{.State.Running}}' "mgmtapp-mysql-dev-container") = "true" ];
      then echo mysql dev already running;
      else docker run -p 3306:3306 -i --name mgmtapp-mysql-dev-container --env-file .env mgmtapp-dev-mysql:1.0; sleep 30; #&& docker exec -i mgmtapp-node-dev-container bash -c 'npx sequelize-cli db:drop ; npx sequelize-cli db:create ; npx sequelize-cli db:migrate ; npx sequelize-cli db:seed:all';
    fi;
fi
docker exec -i mgmtapp-mysql-dev-container bash -c 'npx sequelize-cli db:drop ; npx sequelize-cli db:create ; npx sequelize-cli db:migrate ; npx sequelize-cli db:seed:all'

#read var