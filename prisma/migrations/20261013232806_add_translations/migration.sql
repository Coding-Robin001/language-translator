-- CreateEnum
CREATE TYPE "Language" AS ENUM ('en', 'fr', 'es');

-- CreateEnum
CREATE TYPE "InputMethod" AS ENUM ('text', 'voice');

-- CreateTable
CREATE TABLE "translation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "languageFrom" "Language" NOT NULL,
    "languageTo" "Language" NOT NULL,
    "sourceText" TEXT NOT NULL,
    "translatedText" TEXT NOT NULL,
    "inputMethod" "InputMethod" NOT NULL DEFAULT 'text',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "translation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "translation_userId_createdAt_idx" ON "translation"("userId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "translation" ADD CONSTRAINT "translation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
