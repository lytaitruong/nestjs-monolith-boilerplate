/*
  Warnings:

  - You are about to drop the column `provider` on the `auth` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `users` table. All the data in the column will be lost.
  - Made the column `gender` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "State" AS ENUM ('online', 'offline');

-- AlterTable
ALTER TABLE "auth" DROP COLUMN "provider";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatar",
ADD COLUMN     "image" VARCHAR(128),
ADD COLUMN     "provider" "Provider" NOT NULL DEFAULT 'normal',
ADD COLUMN     "state" "State" NOT NULL DEFAULT 'offline',
ALTER COLUMN "gender" SET NOT NULL,
ALTER COLUMN "gender" SET DEFAULT 'others',
ALTER COLUMN "status" SET NOT NULL;
