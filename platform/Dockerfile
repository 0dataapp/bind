FROM node:20

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app
WORKDIR /app

# copy package.json in isolation to detect changes
ADD package.json .
RUN npm install --omit=dev

ADD . .

ARG _DATA_DIRECTORY="/app/__persistent"

RUN mkdir -m 0700 $_DATA_DIRECTORY
RUN chown $USER:$USER $_DATA_DIRECTORY

RUN npm run build

ENV DATA_DIRECTORY="$_DATA_DIRECTORY"

ENV PORT 3000
EXPOSE 3000

CMD [ "node", "build" ]
