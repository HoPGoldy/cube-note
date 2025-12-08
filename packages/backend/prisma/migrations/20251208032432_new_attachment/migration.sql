/*
  Warnings:

  - You are about to drop the column `md5` on the `Attachment` table. All the data in the column will be lost.
  - Added the required column `hash` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Attachment` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Attachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Attachment" ("createdAt", "filename", "id", "size", "type", "updatedAt") SELECT "createdAt", "filename", "id", "size", "type", "updatedAt" FROM "Attachment";
DROP TABLE "Attachment";
ALTER TABLE "new_Attachment" RENAME TO "Attachment";
CREATE INDEX "Attachment_userId_idx" ON "Attachment"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
