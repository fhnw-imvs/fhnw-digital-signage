sudo sysctl net.ipv4.ip_forward=1
sudo iptables -t nat -A PREROUTING -p tcp -d wnbck.myftp.org --dport 80 -j DNAT --to-destination 127.0.0.1:80
sudo iptables -t nat -A PREROUTING -p tcp -d wnbck.myftp.org --dport 443 -j DNAT --to-destination 127.0.0.1:443
sudo iptables -t nat -A PREROUTING -p tcp -d wnbck.myftp.org --dport 1337 -j DNAT --to-destination 127.0.0.1:1337
sudo iptables -t nat -A POSTROUTING -j MASQUERADE
sudo apt-get update -y && apt-get upgrade -y && apt-get dist-upgrade -y
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
sudo apt-get update -y && apt-get upgrade -y && apt-get dist-upgrade -y
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update -y && apt-get upgrade -y && apt-get dist-upgrade -y
sudo apt-cache policy docker-ce
sudo apt-get install -y docker-ce
sudo apt-get update -y && apt-get upgrade -y && apt-get dist-upgrade -y
sudo chmod 666 /var/run/docker.sock
sudo chmod u+x docker-rebuild-all.sh
sudo cp sslcert/server.cert /etc/ssl/certs
