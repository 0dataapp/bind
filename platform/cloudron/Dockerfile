FROM cloudron/base:5.0.0

RUN mkdir -p /app/code
WORKDIR /app/code

# copy package.json in isolation to detect changes
COPY package.json .
RUN npm install --omit=dev

COPY . .

ARG COMMIT_HASH
ENV VITE_COMMIT_HASH=${COMMIT_HASH}
RUN npm run build

ENV PORT 3000
EXPOSE 3000

ENV DATA_DIRECTORY /app/data

CMD [ "platform/cloudron/start.sh" ]
