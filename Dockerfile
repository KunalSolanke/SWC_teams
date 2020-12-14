FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app


VOLUME /var/run/docker.sock  /var/run/docker.sock
COPY package*.json ./
RUN  npm install
COPY . .
RUN apt-get update && \
    apt-get -y install apt-transport-https \
    ca-certificates \
    curl \
    gnupg2 \
    software-properties-common && \
    curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo "$ID")/gpg > /tmp/dkey; apt-key add /tmp/dkey && \
    add-apt-repository \
    "deb [arch=amd64] https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") \
    $(lsb_release -cs) \
    stable" && \
    apt-get update && \
    apt-get -y install docker-ce


ARG DATABASE_URI
ENV DATABASE_URI ${DATABASE_URI}


EXPOSE 3000

CMD ["npm","run","dev"]

