DROP INDEX "Dock_name_key";
DROP INDEX "DockDay_dockId_idx";
DROP INDEX "DockDay_day_month_year_dockId_key";

ALTER TABLE "Dock" RENAME TO "Station";
ALTER TABLE "Station" RENAME CONSTRAINT "Dock_pkey" TO "Station_Pkey";

ALTER TABLE "DockDay" RENAME TO "StationDay";
ALTER TABLE "StationDay" RENAME CONSTRAINT "DockDay_pkey" TO "StationDay_pkey";
ALTER TABLE "StationDay" RENAME "dockId" to "stationId";

-- CreateIndex
CREATE UNIQUE INDEX "Station_name_key" ON "Station"("name");

-- CreateIndex
CREATE INDEX "StationDay_stationId_idx" ON "StationDay"("stationId");

-- CreateIndex
CREATE UNIQUE INDEX "StationDay_day_month_year_stationId_key" ON "StationDay"("day", "month", "year", "stationId");
