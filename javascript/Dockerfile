FROM node:8-jessie

RUN npm install -g live-server

RUN npm install -g amqplib gulp angular react chart angular-route
RUN npm install -g uuid
RUN npm install -g --save @angular/material @angular/cdk @angular/animations
RUN npm install -g moment --save

COPY entrypoint.sh /

ENTRYPOINT ["/entrypoint.sh"]
