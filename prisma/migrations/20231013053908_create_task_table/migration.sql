-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'CANCELED', 'COMPLETE');

-- CreateTable
CREATE TABLE "tasks" (
    "id" VARCHAR(28) NOT NULL,
    "content" TEXT NOT NULL,
    "hashtag" TEXT[],
    "title" VARCHAR(32) NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "user_id" VARCHAR(28) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tasks_user_id_status_idx" ON "tasks"("user_id", "status");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
