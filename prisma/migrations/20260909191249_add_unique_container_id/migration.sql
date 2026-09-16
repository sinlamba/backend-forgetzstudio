/*
  Warnings:

  - A unique constraint covering the columns `[containerId]` on the table `InstagramContainer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "InstagramContainer_containerId_key" ON "InstagramContainer"("containerId");
