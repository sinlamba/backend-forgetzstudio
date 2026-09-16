/*
  Warnings:

  - The `instagram` column on the `Gallery` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `facebook` column on the `Gallery` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tiktok` column on the `Gallery` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `threads` column on the `Gallery` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Gallery" DROP COLUMN "instagram",
ADD COLUMN     "instagram" BOOLEAN,
DROP COLUMN "facebook",
ADD COLUMN     "facebook" BOOLEAN,
DROP COLUMN "tiktok",
ADD COLUMN     "tiktok" BOOLEAN,
DROP COLUMN "threads",
ADD COLUMN     "threads" BOOLEAN;
