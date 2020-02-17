const net = require('net');
require('dotenv').config();
const exec = require('child_process');
const os = require('os');

const puts = (error, stdout, stderr) =>  {
    console.log(stdout);
    if(error)
        console.log(stderr);
};

//then run command depending on the OS
if (process.argv.length === 2) {
    console.error('Expected at least one argument!');
    process.exit(1);
} else {
    if (os.type() === 'Windows_NT' || os.type() === 'Darwin' || os.type() === 'Linux') {
        console.log("OS: " + os.type());
        process.env.NODE_ENV = process.argv[2];
        console.log("ENV: " +  process.argv[2]);
        if(process.argv[2] === "development") {
            exec.exec("docker-reset.sh && run-mysql-dev.sh", puts);

            let refreshId = setInterval(() => {
                console.log("waiting for MySQL dev");
                net.createConnection(3306, "127.0.0.1")
                .on("connect", () => {
                    console.log("MySQL Server 127.0.0.1:3306 is ready starting seed");
                    exec.execSync("npx sequelize-cli db:drop && npx sequelize-cli db:create && npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all", {stdio: 'inherit'});
                    clearInterval(refreshId);
                }).on("error", (e) => {
                    console.log("not ready...");
                });
            },1000);
        } else if (process.argv[2] === "production") {
            //if unix ensure that permissions are granted
            if (os.type() === "Linux") {
                exec.execSync("sudo chmod 666 /var/run/docker.sock", {stdio: 'inherit'});
            }
            exec.execSync(
                //"docker image inspect mgmtapp-baseimage:1.1 >/dev/null 2>&1 && echo baseimage already exists || docker load -i mgmtapp-baseimage.tar" +
                " docker container stop mgmtapp-mysql-dev-container" +
                " & docker container stop mgmtapp-mysql-container" +
                " & docker container stop mgmtapp-node-container" +
                " & docker container rm mgmtapp-mysql-container" +
                " & docker container rm mgmtapp-node-container" +
                " & docker rmi mgmtapp-mysql:1.0" +
                " & docker rmi mgmtapp-node:1.0" +
                " & docker network rm mgmtapp-net & exit 0", {stdio: 'inherit'});
            console.log("creating docker network");
            exec.execSync("docker network create " +
                "--driver bridge " +
                "--gateway 172.16.0.1 " +
                "--subnet 172.16.0.0/29 mgmtapp-net", {stdio: 'inherit'});
            console.log("creating mysql image");
            exec.execSync("docker build " +
                "--tag mgmtapp-mysql:1.0 " +
                "--network mgmtapp-net ./db/", {stdio: 'inherit'});
            console.log("creating node image");
            exec.execSync("docker build" +
                " --build-arg port=" + process.env.PORT +
                " --tag mgmtapp-node:1.0" +
                //" --no-cache" +
                " --network mgmtapp-net .", {stdio: 'inherit'});
            console.log("starting mysql server");
            exec.execSync("docker run" +
                " -p " + process.env.MYSQL_PORT + ":" + process.env.MYSQL_PORT  +
                " -itd" +
                " --env-file .env" +
                " --name mgmtapp-mysql-container" +
                " --network=mgmtapp-net" +
                " --log-opt max-size=50m" +
                " --ip 172.16.0.2 mgmtapp-mysql:1.0", {stdio: 'inherit'});
            console.log("waiting for mysql server");
            let port80 = process.env.PORT80 === "YES" ? "-p 80:80 " : "";
            let port443 = process.env.PORT443 === "YES" ? "-p 443:443 " : "";
            exec.execSync("docker run " +
                "-p " + process.env.PORT + ":" + process.env.PORT + " " +
                port80 + port443 + " -itd" +
                " --env-file .env" +
                " -e NODE_ENV=production" +
                " --name mgmtapp-node-container" +
                " --network=mgmtapp-net" +
                " --log-opt max-size=50m" +
                " --ip 172.16.0.3 mgmtapp-node:1.0", {stdio: 'inherit'});
            console.log("waiting for node server");
            console.log("waiting for MySQL dev");
            setTimeout(() => {
                console.log("MySQL Server 127.0.0.1:3306 is ready starting seed");
                console.log("seeding...");
                exec.execSync("chmod u+x seed.sh & ./seed.sh", {stdio: 'inherit'});
                console.log("seeding complete");
            }, 10000);

        } else if (process.argv[2] === "deployment") {
            if(os.type() !== "Linux"){
                console.error("os not supported for deployment");
                return;
            }
            if(process.env.HOSTNAME === "")
                process.env.HOSTNAME = "127.0.0.1";
            exec.execSync("sudo sysctl net.ipv4.ip_forward=1", {stdio: 'inherit'});
            exec.execSync(process.env.PORT80 === "YES" ? "sudo iptables -t nat -A PREROUTING -p tcp -d "+process.env.HOSTNAME+" --dport 80 -j DNAT --to-destination 127.0.0.1:80" : "", {stdio: 'inherit'});
            exec.execSync(process.env.PORT443 === "YES" ? "sudo iptables -t nat -A PREROUTING -p tcp -d "+process.env.HOSTNAME+" --dport 443 -j DNAT --to-destination 127.0.0.1:443" : "", {stdio: 'inherit'});
            exec.execSync("sudo iptables -t nat -A PREROUTING -p tcp -d "+process.env.HOSTNAME+" --dport " + process.env.PORT + " -j DNAT --to-destination 127.0.0.1:" + process.env.PORT, {stdio: 'inherit'});
            exec.execSync("sudo iptables -t nat -A POSTROUTING -j MASQUERADE", {stdio: 'inherit'});
            exec.execSync("sudo apt-get update -y && sudo apt-get upgrade -y && sudo apt-get dist-upgrade -y", {stdio: 'inherit'});
            exec.execSync("curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -", {stdio: 'inherit'});
            exec.execSync("sudo apt-get update -y && sudo apt-get upgrade -y && sudo apt-get dist-upgrade -y", {stdio: 'inherit'});
            exec.execSync("sudo add-apt-repository \"deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable\"", {stdio: 'inherit'});
            exec.execSync("sudo apt-get update -y && sudo apt-get upgrade -y && sudo apt-get dist-upgrade -y", {stdio: 'inherit'});
            exec.execSync("sudo apt-cache policy docker-ce", {stdio: 'inherit'});
            exec.execSync("sudo apt-get install -y docker-ce", {stdio: 'inherit'});
            exec.execSync("sudo apt-get update -y && sudo apt-get upgrade -y && sudo apt-get dist-upgrade -y", {stdio: 'inherit'});
            exec.execSync("sudo chmod 666 /var/run/docker.sock", {stdio: 'inherit'});
            exec.execSync("sudo cp sslcert/server.cert /etc/ssl/certs", {stdio: 'inherit'});

            exec.execSync(
                //"docker image inspect mgmtapp-baseimage:1.1 >/dev/null 2>&1 && echo baseimage already exists || docker load -i mgmtapp-baseimage.tar" +
                " docker container stop mgmtapp-mysql-dev-container" +
                " & docker container stop mgmtapp-mysql-container" +
                " & docker container stop mgmtapp-node-container" +
                " & docker container rm mgmtapp-mysql-container" +
                " & docker container rm mgmtapp-node-container" +
                " & docker rmi mgmtapp-mysql:1.0" +
                " & docker rmi mgmtapp-node:1.0" +
                " & docker network rm mgmtapp-net & exit 0", {stdio: 'inherit'});
            console.log("creating docker network");
            exec.execSync("docker network create " +
                "--driver bridge " +
                "--gateway 172.16.0.1 " +
                "--subnet 172.16.0.0/29 mgmtapp-net", {stdio: 'inherit'});
            console.log("creating mysql image");
            exec.execSync("docker build " +
                "--tag mgmtapp-mysql:1.0 " +
                "--network mgmtapp-net ./db/", {stdio: 'inherit'});
            console.log("creating node image");
            exec.execSync("docker build" +
                " --build-arg port=" + process.env.PORT +
                " --tag mgmtapp-node:1.0" +
                //" --no-cache" +
                " --network mgmtapp-net .", {stdio: 'inherit'});
            console.log("starting mysql server");
            exec.execSync("docker run" +
                " -p " + process.env.MYSQL_PORT + ":" + process.env.MYSQL_PORT  +
                " -itd" +
                " --env-file .env" +
                " --name mgmtapp-mysql-container" +
                " --network=mgmtapp-net" +
                " --log-opt max-size=50m" +
                " --ip 172.16.0.2 mgmtapp-mysql:1.0", {stdio: 'inherit'});
            console.log("waiting for mysql server");
            let port80 = process.env.PORT80 === "YES" ? "-p 80:80 " : "";
            let port443 = process.env.PORT443 === "YES" ? "-p 443:443 " : "";
            exec.execSync("docker run " +
                "-p " + process.env.PORT + ":" + process.env.PORT + " " +
                port80 + port443 + " -itd" +
                " --env-file .env" +
                " -e NODE_ENV=production" +
                " --name mgmtapp-node-container" +
                " --network=mgmtapp-net" +
                " --log-opt max-size=50m" +
                " --ip 172.16.0.3 mgmtapp-node:1.0", {stdio: 'inherit'});
            console.log("waiting for node server");
            console.log("seeding...");
            exec.execSync("seed.sh", {stdio: 'inherit'});
            console.log("seeding complete");
        }
    } else {
        throw new Error("Unsupported OS found: " + os.type());
    }
}
