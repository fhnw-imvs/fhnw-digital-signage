FROM node:latest

ARG port=1337

WORKDIR .

EXPOSE $port $port
EXPOSE 80 80
EXPOSE 443 443

COPY . ./mgmt_app_server_backend/

RUN cd mgmt_app_server_backend && npm i --force && npm i -g npx --force \
&& cd mgmt_app_server_frontend && npm i --force && npm run build --force && cd ..

CMD cd mgmt_app_server_backend && node server.js