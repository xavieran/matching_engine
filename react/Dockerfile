FROM node:8-jessie

RUN npm install -g live-server

RUN npm install -g amqplib
RUN npm install -g chart
RUN npm install -g moment --save
RUN npm install -g react react-numeric-input react-dom react-router react-router-dom react-bootstrap bootstrap

COPY entrypoint.sh /

ENTRYPOINT ["/entrypoint.sh"]
