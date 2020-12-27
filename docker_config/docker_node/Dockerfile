FROM node:latest


RUN mkdir -p /usr/src/app
RUN mkdir -p /usr/src/app/src


COPY ./src/package*.json /usr/src/app/src/
RUN cd /usr/src/app/src && npm install
COPY . /usr/src/app
# COPY ./src/.env /usr/src/app/src/.env


EXPOSE 3000


