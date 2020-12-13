FROM node:latest-alphine


RUN mkdir -p /usr/src/app
RUN mkdir -p /usr/src/app/src



COPY ./src/package*.json /usr/src/app/src/
RUN cd /usr/src/app/src && npm install
COPY . /usr/src/app


#load env varialbles here
#sed -i 's+#<ENV>+ENV PORT 3000\n#<ENV>+g' docker_config/docker_node/Dockerfile
#<ENV>

EXPOSE 3000

CMD ["node",<main-file>]

