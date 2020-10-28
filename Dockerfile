FROM node:latest-alphine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app


VOLUME /var/run/docker.sock  /var/run/docker.sock
COPY package*.json ./
RUN  npm install
COPY . .



ARG DATABASE_URI
ENV DATABASE_URI ${DATABASE_URI}

EXPOSE 8000

CMD ["npm","dev"]

