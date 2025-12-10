-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "parentPath" TEXT,
    "tagIds" TEXT,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT,
    "listSubarticle" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Article" ("color", "content", "createdAt", "favorite", "id", "parentPath", "tagIds", "title", "updatedAt") SELECT "color", "content", "createdAt", "favorite", "id", "parentPath", "tagIds", "title", "updatedAt" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
CREATE INDEX "Article_parentPath_idx" ON "Article"("parentPath");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
