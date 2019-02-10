FROM node:8-jessie

RUN npm install -g live-server

RUN npm install -g amqplib
RUN npm install -g chart
RUN npm install -g gulp 
RUN npm install -g uuid
RUN npm install -g moment --save
RUN npm install -g react react-dom react-router react-router-dom react-bootstrap

COPY entrypoint.sh /

ENTRYPOINT ["/entrypoint.sh"]
