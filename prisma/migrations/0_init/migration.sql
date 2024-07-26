-- CreateTable
CREATE TABLE "Dock" (
    "id" SERIAL NOT NULL,
    "borough" TEXT,
    "communityDistrict" INTEGER,
    "councilDistrict" INTEGER,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Dock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DockDay" (
    "id" SERIAL NOT NULL,
    "acoustic" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "dockId" INTEGER NOT NULL,
    "electric" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "DockDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dock_name_key" ON "Dock"("name");

-- CreateIndex
CREATE INDEX "DockDay_dockId_idx" ON "DockDay"("dockId");

-- CreateIndex
CREATE UNIQUE INDEX "DockDay_day_month_year_dockId_key" ON "DockDay"("day", "month", "year", "dockId");

