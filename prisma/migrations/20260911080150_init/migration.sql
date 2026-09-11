-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "toName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "fromAlias" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Note_toName_idx" ON "Note"("toName");

-- CreateIndex
CREATE INDEX "Note_createdAt_idx" ON "Note"("createdAt");
