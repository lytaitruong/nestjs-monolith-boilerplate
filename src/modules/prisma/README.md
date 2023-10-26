# PrismaORM Documentation

## What is it

- Prisma is a ORM (Object-Relational Mapping) tool
  - Allow you management database with GUI
  - Allow execute query builder safety
  - Allow you write code cleaner via interface

## Why we need

- It provide GUI for you manipulate database
- It provide syntax to query builder cleaner than any ORM
- It provide migration, rollback if the new version has error
- It provide file independency for you management as a github
- It provide proxy to keep connection query faster

## When we use

- It suitable both small project and big project when apply DDD
- When your database is need to edit and update many times
- When your database is need upgrade version like v1,v2,v3
- When your database support multi-tenant

## How to implement

- Install
  - Run `bunx add @prisma/client` to have query builder in your code later
  - Run `bunx add prisma -D` to have CLI to execute
  - Run `bunx prisma init` to generate folder prisma schema
- [Start from Scratch](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch)
  - Add/Edit table in your prisma.schema file
  - Run `bunx prisma generate` to generate interface & type to write code
  - Run `bunx prisma migrate --dev --name {file_name}` to migration new update schema to database
    - If false `bunx migrate resolve --rolled-back {file_name}` to revert
    - Then edit and retry again [guide](https://www.prisma.io/docs/guides/migrate/production-troubleshooting#failed-migration)
- [From another ORM](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project)
  - Run `bunx prisma db pull` to sync all table of database to prisma.schema file
  - Run `bunx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/{init}/migration.sql` to generate mySQL file
  - Run `bunx prisma migrate resolve --apply {init}` to sync between localhost and database
  - With development
    - Run `bunx prisma migrate dev` in to verify schema.prisma is matching with database in cloud
  - With production
    - Run `bunx prisma migrate deploy` to sync between dev database and prod database

## Best Practice for database

### Apply Index

- Please follow [index rules](https://www.mongodb.com/docs/manual/tutorial/equality-sort-range-rule)
- Please using composition index as much as you can
  - The position of where condition is impact performance query
- Remember:
  - SELECT: select from index table faster than original table
  - CREATE: 1 execute add original table + 1 execute to update index table
  - UPDATE: 1 execute edit original table + 1 execute to find in index table + 1 execute to update index table
- So when add much index -> Query faster, Create/Edit/Delete slower

- With Geographic Database
  - The Generalized Search Tree (GIST) indexes can be useful when indexing geometric data and implementing text search

### Partition

- Partition when you want to scale horizontally (maximum 1024 partition - best practice is 1 partition 10GB)
  - Partition Range: Suitable with Log, Transaction via Date, Time
  - Partition List : Suitable with Geographic, Area via Enum, Constant
  - Partition Hash : It your database very large.

### ACID Transaction rule

- Guide how to [implement](https://www.mongodb.com/basics/acid-transactions)
- Atomicity: A transaction either succeeds wholly or entirely fails.
- Consistency: During a transaction, we transition the database from one valid state to another.
- Isolation: More than one transaction can run concurrently without risking an invalid state of our database.
- Durability: The changes from the transaction should persist permanently as soon as we commit them.

### Design pattern database

- You can view on [here](https://www.mongodb.com/blog/post/building-with-patterns-a-summary)
- Bonus [pattern](https://www.mongodb.com/search?addsearch=pattern)
