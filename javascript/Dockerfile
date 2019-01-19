FROM node:8-jessie

RUN npm install -g live-server

RUN npm install -g amqplib gulp angular react chart
RUN npm install -g uuid

COPY entrypoint.sh /

ENTRYPOINT ["/entrypoint.sh"]
