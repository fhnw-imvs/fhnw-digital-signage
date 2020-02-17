
docker container stop mgmtapp-mysql-container
docker container stop mgmtapp-node-container

docker container rm mgmtapp-mysql-container
docker container rm mgmtapp-node-container

docker rmi mgmtapp-mysql:1.0
docker rmi mgmtapp-node:1.0

docker network rm mgmtapp-net