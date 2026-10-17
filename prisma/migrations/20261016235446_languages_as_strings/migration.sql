/*
  Warnings:

  - Changed the type of `languageFrom` on the `translation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `languageTo` on the `translation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "translation" DROP COLUMN "languageFrom",
ADD COLUMN     "languageFrom" TEXT NOT NULL,
DROP COLUMN "languageTo",
ADD COLUMN     "languageTo" TEXT NOT NULL;
