FROM node:20

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app
WORKDIR /app

# copy package.json in isolation to detect changes
ADD package.json .
RUN npm install

ADD . .

RUN npm run build

ENV PORT 3000
EXPOSE 3000

CMD [ "npm", "run", "production" ]
