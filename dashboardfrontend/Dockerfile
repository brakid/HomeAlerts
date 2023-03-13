FROM node:19 as builder

WORKDIR /app
ARG backend
ENV REACT_APP_BACKEND ${backend}

COPY package*.json .
RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

WORKDIR /app

EXPOSE 80

COPY --from=builder /app/build ./build
COPY ./config/nginx.conf /etc/nginx/nginx.conf