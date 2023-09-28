<p align="center">
  <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  <a href="https://bun.sh/" alt="Bun" target="_blank">
    <img src="https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white" />
  </a>
  <a href="https://node.js.org/" alt="NodeJS" target="_blank">
    <img src="https://img.shields.io/badge/node.js-6DA55F.svg?style=for-the-badge&logo=node.js&logoColor=white" />
  </a>
  <a href="https://nestjs.com/" alt="NestJS" target="_blank">
    <img src="https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white" />
  </a>
  <a href="https://www.typescriptlang.org/" alt="TypeScript" target="_blank">
    <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" />
  </a>
    <a href="https://www.prisma.io/" alt="Prisma" target="_blank">
    <img src="https://img.shields.io/badge/Prisma-3982CE.svg?style=for-the-badge&logo=Prisma&logoColor=white" />
  </a>
  </a>
    <a href="https://www.postgresql.org/" alt="PostgreSQL" target="_blank">
    <img src="https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white" />
  </a>
</p>

<h1 align="center">NESTJS BOILERPLATE</h1>

## Preface

- This NestJS boilerplate provide utility modules support developer can be quickly build restful APIs safety and quickly
- Why we choose NestJS, Why not choose [Express](https://expressjs.com/) or [Koa](https://koajs.com/)
  - When I attended interviews in VietNam, a lot of senior developers ask me this question
  - The answer is:
    - `Architecture`
      - With project I have joined (not I build from scratch), using Express or Hapi framework have the codebase with folder structure, coding style is difference. So a new developer take a lot of time to approach and understand structure folder to be contributor
      - So that NestJS provide a standard template for every developer using NodeJS can quickly approach to contributor
      - In the behind it still using Express or Fastify (I prefer using Fastify because for the performance)
    - `Typescript`
      - It require every developer need to know Typescript to contribution
      - Typescript support interface and type so that every developer can easily understand and debug

- It will includes:
  - [x] Setup Prisma Database Connection
  - [ ] Setup Swagger
  - [ ] Setup Centralize Handling Error
  - [ ] Setup Middleware Utilize
  - [ ] Setup Cache using Redis or Local LRU
  - [ ] Setup Auth Jsonwebtoken
  - [ ] Setup Docker
  - [ ] Setup Queue using Bull

## How to use

### Step 1: Installation

- Install [NodeJS v20](https://nodejs.org/en)
- Install [Bun v1](https://bun.sh/)

### Step 2: Start server

- Run `docker-compose up -d --build` to spin up services or tools we using
- Run `bun install` to install all package dependencies
- Run `bun run prisma:generate` to generate a data access layer (DAL) to query database
  - If the first-time or renew database `bun run prisma:migrate-dev` to migrate all database
- Run `bun run start:dev` to development new feature
- Run `bun run start:pro` to start server on cloud

## Database Config

- We using [PostgreSQL](https://www.postgresql.org/docs/16/index.html) v16 and [Prisma](https://www.prisma.io/docs/concepts) v5 to communication with database
- After try using Knex, TypeORM, Prisma...
  - I think Prisma is the most ORM for developer can easily design, management, migration...
  - It working like Github which allow you record a history of changes via .sql migration files, so that you can checking the difference of each version or rollback easier
  - You can read more in here to [comparison between Prisma and Other ORMs](https://www.prisma.io/docs/concepts/more/comparisons)


## Reference

- [Prisma PostgreSQL approach](https://www.prisma.io/blog/nestjs-prisma-rest-api-7D056s1BmOL0) to make you familiar with Prisma
