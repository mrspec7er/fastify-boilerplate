# Backend Boilerplate

Boilerplate for setup fastify backend framework.

## Description

This boilerplate cover basic function for backend service like CRUD, Send Email, Storig Files, Authentication and Payment.

## Getting Started

### Dependencies

- fastify fastify-multer @fastify/static bcrypt nodemailer cors crypto midtrans-client dotenv fast-jwt morgan node-schedule

### Development Dependencies

- typescript prisma @types/node @types/jsonwebtoken @types/bcrypt @types/cors @types/node-schedule @types/nodemailer nodemon ts-node

## Setup

### Setup Base Project:

```
npm init -y
```

```
npm i fastify @fastify/static bcrypt cors dotenv fast-jwt @fastify/schedule toad-scheduler
```

```
npm i -D typescript @types/node @types/bcrypt @types/cors nodemon ts-node
```

```
npx tsc --init
```

- set compilerOptions.target to "ES2017"
- create file nodemon.json and automation script in package.json
- create and setup file index.ts
- create controller and routes file

### Setup Database:

```
npm install prisma --save-dev
```

```
npx prisma init --datasource-provider postgresql
```

- create database model

```
npx prisma db push
```

```
npx prisma migrate dev --name init
```

```
npx prisma generate
```

### Setup file input:

```
npm i fastify-multer
```

- create input handler middleware
- apply middleware in endpoint routes
- for multiple files, create manual error handling

### Setup email services

```
npm i nodemailer
```

- create smtp server
- create email service function

### Setup payment services

```
npm i crypto midtrans-client
```

- create midtrans account
- get server and client key
- create endpoint for create new transaction
- create endpoint that handle both notification and payment status
- create endpoint for redirect success and failed payment

## Authors

[@miracle8oys](https://twitter.com/miracle8oys)

## Version History

- 0.1
  - Initial Release
