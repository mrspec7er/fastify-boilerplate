FROM postgres:15.2-alpine as postgres

ENV POSTGRES_PASSWORD=mrc201

FROM node:lts-alpine3.16 as fastify

COPY . /app/

WORKDIR /app

RUN npm install

COPY request.d.ts node_modules/fastify/types

CMD npx prisma migrate deploy ; npm start