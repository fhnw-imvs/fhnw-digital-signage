docker image inspect mgmtapp-baseimage:1.1 >/dev/null 2>&1 && echo baseimage already exists || docker load -i mgmtapp-baseimage.tar

docker container stop mgmtapp-mysql-dev-container

docker container stop mgmtapp-mysql-container
docker container stop mgmtapp-node-container

docker container rm mgmtapp-mysql-container
docker container rm mgmtapp-node-container

docker rmi mgmtapp-mysql:1.0
docker rmi mgmtapp-node:1.0

docker network rm mgmtapp-net
docker network create --driver bridge --gateway 172.16.0.1 --subnet 172.16.0.0/29 mgmtapp-net

docker build --tag mgmtapp-mysql:1.0 --network mgmtapp-net ./db/
docker build --tag mgmtapp-node:1.0 --network mgmtapp-net .

docker run -p 3306:3306 -itd --env-file .env -e NODE_ENV=production --name mgmtapp-mysql-container --network=mgmtapp-net --log-opt max-size=50m --ip 172.16.0.2 mgmtapp-mysql:1.0
echo "waiting for mysql server..."
sleep 10
docker run -p 1337:1337 -p 80:80 -p 443:443 -itd --env-file .env -e NODE_ENV=production --name mgmtapp-node-container --network=mgmtapp-net --log-opt max-size=50m --ip 172.16.0.3 mgmtapp-node:1.0
echo "waiting for node server..."
sleep 10
docker exec -i mgmtapp-node-container bash -c 'cd mgmt_app_server_backend ; npx sequelize-cli db:drop ; npx sequelize-cli db:create ; npx sequelize-cli db:migrate ; npx sequelize-cli db:seed:all'
sleep 10