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

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
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
      - In the behind it still using Express or Fastify (I prefer using Fastify because for the [performance](https://github.com/lytaitruong/nestjs-benchmark))
    - `Typescript`
      - It require every developer need to know Typescript to contribution
      - Typescript support interface and type so that every developer can easily understand and debug

## Features

- [x] Setup Database ([Prisma v5](https://www.prisma.io/))
- [x] Setup Framework ([Fastify](https://fastify.dev/))
- [x] Setup Document API ([Swagger](https://swagger.io/))
- [x] Setup Centralize Handling Error
- [x] Setup Middleware Utilize
- [x] Setup Logger & Plugin
- [x] Setup Auth JWT
  - [x] Integration with Oauth2 Google
  - [x] Integration with Oauth2 Github
  - [x] Update database for Auth
- [x] Setup Cache using Redis or Local LRU
- [x] Setup Docker
- [x] Setup Base CRUD follow DRY principles
- [x] Setup Queue using BullMQ
- [x] Setup Upload file ([Aws S3](https://aws.amazon.com/s3/))
  - [x] Using BullMQ to process converter image to WebP and upload to s3
  - [x] Using BullMQ separate worker to prevent block event loop
- [x] Setup Stream large file CSV
  - [x] Using BullMQ to process bulk-write insert
  - [x] Using BullMQ to rollback if any error
  - [x] Using BullMQ to notification if success or failed to notice for end-user
- [x] Setup Content delivery network ([Aws Cloudfront](https://aws.amazon.com/cloudfront/))
  - [x] Setup Policies access
  - [x] Setup Presigned URL to restrict unauthorized access
  - [x] Setup Presigned Cookies to authorize users to access resources
- [x] Setup Webhook ([Stripe](https://stripe.com/))
  - [x] Apply [Dynamic Module](https://docs.nestjs.com/fundamentals/dynamic-modules)
  - [x] Apply [DIP](https://trilon.io/blog/dependency-inversion-principle)
- [x] Setup i18 localize
- [ ] Flags Feature
- [ ] Multi tenant database
- [ ] Github actions to ECS
- [ ] Terraform
- [ ] Build documentation for everyone can fork
- [ ] Setup Loki + Promtail to logs
- [ ] Setup Prometheus for metrics
- [ ] Setup Grafana for monitoring
- [ ] Setup Tempo for Tracing
- [ ] Worker Threads


## How to use

### Step 1: Installation

- Install [NodeJS v20](https://nodejs.org/en)

```bash
### Install NVM which manage node version
brew install nvm
### Install Node v20
nvm install v20
```

- Install [Bun v1](https://bun.sh/)

```bash
brew tap oven-sh/bun
brew install bun
```

### Step 2: Start server

```bash
# spin up third-party like database, metric, cache... which server is dependent
docker-compose up -d --build

# install all package dependencies
bun install

# generate a data access layer (DAL) to communication with database
bun run prisma:generate

# (optional) if first-time or renew database run this command
bun run prisma:migrate-dev

# start to development new feature and debug
bun run start:dev

# start to hosting server on cloud
bun run start:pro
```

## Database Config

- We using [PostgreSQL](https://www.postgresql.org/docs/16/index.html) v16 and [Prisma](https://www.prisma.io/docs/concepts) v5 to communication with database
- After try using Knex, TypeORM, Prisma...
  - I think Prisma is the most ORM for developer can easily design, management, migration...
  - It working like Github which allow you record a history of changes via .sql migration files, so that you can checking the difference of each version or rollback easier
  - You can read more in here to [comparison between Prisma and Other ORMs](https://www.prisma.io/docs/concepts/more/comparisons)

## Reference

- [Prisma PostgreSQL approach](https://www.prisma.io/blog/nestjs-prisma-rest-api-7D056s1BmOL0) to make you familiar with Prisma
