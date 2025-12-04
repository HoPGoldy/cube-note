-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "parentPath" TEXT,
    "tagIds" TEXT,
    "favorite" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "ArticleRelation" (
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,

    PRIMARY KEY ("fromId", "toId"),
    CONSTRAINT "ArticleRelation_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ArticleRelation_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "color" TEXT,
    "groupId" TEXT,
    CONSTRAINT "Tag_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "TagGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TagGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "filename" TEXT NOT NULL,
    "md5" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Article_parentPath_idx" ON "Article"("parentPath");

-- CreateIndex
CREATE INDEX "ArticleRelation_fromId_idx" ON "ArticleRelation"("fromId");

-- CreateIndex
CREATE INDEX "ArticleRelation_toId_idx" ON "ArticleRelation"("toId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_title_key" ON "Tag"("title");

-- CreateIndex
CREATE INDEX "Tag_groupId_idx" ON "Tag"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "TagGroup_title_key" ON "TagGroup"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Attachment_md5_key" ON "Attachment"("md5");

-- CreateIndex
CREATE INDEX "Attachment_md5_idx" ON "Attachment"("md5");
