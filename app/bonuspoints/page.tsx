import BonusPointsPage from './BonusPointsPage';

import type { Metadata } from "next";

import React from "react";

import { getBonusPoints, getPlayers } from "./action";

export const metadata: Metadata = {
  title: "Bonus Points | Facts Party",
};

export default async function BonusPoints() {
  const players = await getPlayers();
  const bonusPoints = await getBonusPoints();

  return <BonusPointsPage initBonusPoints={bonusPoints} players={players} />;
}
