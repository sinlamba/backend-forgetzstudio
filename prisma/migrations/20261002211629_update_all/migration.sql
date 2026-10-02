/*
  Warnings:

  - You are about to drop the column `platfrom` on the `ContainerId` table. All the data in the column will be lost.
  - You are about to drop the column `platfromUserId` on the `ContainerId` table. All the data in the column will be lost.
  - You are about to drop the `PlatfromIntegration` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `platform` to the `ContainerId` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platformUserId` to the `ContainerId` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PlatfromIntegration" DROP CONSTRAINT "PlatfromIntegration_userId_fkey";

-- AlterTable
ALTER TABLE "ContainerId" DROP COLUMN "platfrom",
DROP COLUMN "platfromUserId",
ADD COLUMN     "platform" TEXT NOT NULL,
ADD COLUMN     "platformUserId" TEXT NOT NULL;

-- DropTable
DROP TABLE "PlatfromIntegration";

-- CreateTable
CREATE TABLE "PlatformIntegration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "platformUserId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlatformIntegration_userId_platform_key" ON "PlatformIntegration"("userId", "platform");

-- AddForeignKey
ALTER TABLE "PlatformIntegration" ADD CONSTRAINT "PlatformIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
