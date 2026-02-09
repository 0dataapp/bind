FROM cloudron/base:5.0.0

RUN mkdir -p /app/code
WORKDIR /app/code

# copy package.json in isolation to detect changes
ADD package.json .
RUN npm install

ADD . .

RUN npm run build

ENV PORT 3000
EXPOSE 3000

ENV DATA_DIRECTORY /app/data/gs

CMD [ "cloudron/start.sh" ]
