FROM node:19-slim

WORKDIR /app

ENV KAFKA_BROKER=localhost

EXPOSE 8080

COPY . .
RUN npm install
RUN npm run build

CMD node ./dist/server.js