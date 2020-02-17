# Mgmt App - Server

## Getting Started

### Prerequisites
```
Node.js
Docker
```
**Get Source if not locally present**
```
git clone <backend repository url>
cd mgmt_app_server_frontend
git clone <frontend repository url>
```
## Deployment

### Deploy
For deployment it is necessary to change the Pre Shared Key which is set in the File ./tools/global.js for in-memory
this will be overriden by the first registration data row in the MySQL database.

* change seeders in .db/seeders/ folder accordingly to your needs
* change .env file to your needs
* check run.js for your corresponding docker setup
* change SSL certificates accordingly in server.js, normally you would like to put your certificates under sslcert/"HOSTNAME"/ this also depends on the format of your certificates.
#### build docker containers:
```
npm i
npm run prod
```
this will:
* build and run MySQL docker container
* build and run Node docker container

### Troubleshooting
If you encounter any issues, see the run.js file to debug what exactly is not going as planned.

## Development
**Get npm dependencies**
```
npm i
```
**Run Project**
```
npm run dev
```
### Running tests
see tests folder for backend api endpoint tests
## API-Docs
see /api-docs/ route for swagger documentation
## Useful scripts
Build
```
./docker-build.sh
```
If you want to revert all containers and changes to it (*DELETES DATABASE*)
```
./docker-reset.sh
```
Rebuild everything (*DELETES DATABASE*)
```
./docker-rebuild-all.sh
```
See /db/config/database.json for the different sql tables used

**Handle data mapping and seeding**
Seed database according to seeders and skeletons in db folder:
```
./seed.sh
```

## Built With

* [npm](https://www.npmjs.com) - Dependency Management
* [Node.js](https://www.nodejs.org/) - Server Application
* [Sequelize](https://sequelize.org/) - ORM for MySQL
* [Swagger](https://swagger.io/) - API Documentation
* [MySQL](https://www.mysql.com/de/) - Database

For a full list of dependencies, see package.json in the project root

## Authors

* **Alexander Weinbeck** - [Alexander Weinbeck](https://gitlab.fhnw.ch/alexander.weinbeck)
* **Mauro Stehle** - [Mauro Stehle](https://gitlab.fhnw.ch/mauro.stehle)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgements

* Stackoverflow
