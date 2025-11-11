-- CreateTable
CREATE TABLE "Experiment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prompt" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "tempMin" REAL NOT NULL,
    "tempMax" REAL NOT NULL,
    "tempStep" REAL NOT NULL,
    "topPMin" REAL NOT NULL,
    "topPMax" REAL NOT NULL,
    "topPStep" REAL NOT NULL,
    "totalCombinations" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "durationMs" INTEGER,
    "errorMessage" TEXT
);

-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "experimentId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "temperature" REAL NOT NULL,
    "topP" REAL NOT NULL,
    "content" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "finishReason" TEXT,
    CONSTRAINT "Response_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "responseId" TEXT NOT NULL,
    "readability" REAL NOT NULL,
    "coverage" REAL NOT NULL,
    "structure" REAL NOT NULL,
    "redundancy" REAL NOT NULL,
    "coherence" REAL NOT NULL,
    "lengthScore" REAL NOT NULL,
    "aggregate" REAL NOT NULL,
    CONSTRAINT "Metrics_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "Response" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Metrics_responseId_key" ON "Metrics"("responseId");
