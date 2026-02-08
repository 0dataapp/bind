FROM node:20

RUN mkdir -p /app
WORKDIR /app

# copy package.json in isolation to detect changes
ADD package.json /app/
RUN npm install

ADD . /app

ENV PORT 3000
EXPOSE 3000

CMD [ "npm", "run", "production" ]
