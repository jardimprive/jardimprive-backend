/*
  Warnings:

  - A unique constraint covering the columns `[teamCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isTeamLeader" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "teamCode" TEXT;

-- CreateTable
CREATE TABLE "TeamLeaderCommission" (
    "id" TEXT NOT NULL,
    "leaderId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamLeaderCommission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_teamCode_key" ON "User"("teamCode");

-- AddForeignKey
ALTER TABLE "TeamLeaderCommission" ADD CONSTRAINT "TeamLeaderCommission_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamLeaderCommission" ADD CONSTRAINT "TeamLeaderCommission_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
