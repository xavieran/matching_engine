FROM node:8-jessie

RUN npm install -g live-server

RUN npm install -g amqplib
RUN npm install -g chart
RUN npm install -g moment --save
RUN npm install -g \
    react \
    react-numeric-input \
    react-dom \
    react-router \
    react-router-dom \
    react-bootstrap \
    bootstrap \
    react-chartjs-2 \
    chart.js \
    serve \
    --save


COPY . /fixed
RUN cd /fixed && npm run build 

COPY entrypoint.sh /

ENTRYPOINT ["/entrypoint.sh"]
