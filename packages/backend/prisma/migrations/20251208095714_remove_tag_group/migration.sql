/*
  Warnings:

  - You are about to drop the `TagGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `groupId` on the `Tag` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "TagGroup_title_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TagGroup";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "color" TEXT
);
INSERT INTO "new_Tag" ("color", "createdAt", "id", "title", "updatedAt") SELECT "color", "createdAt", "id", "title", "updatedAt" FROM "Tag";
DROP TABLE "Tag";
ALTER TABLE "new_Tag" RENAME TO "Tag";
CREATE UNIQUE INDEX "Tag_title_key" ON "Tag"("title");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
