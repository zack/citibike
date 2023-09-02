import BonusPointsPage from './BonusPointsPage';

import React from "react";

import { getBonusPoints, getPlayers } from "./action";

export default async function BonusPoints() {
  const players = await getPlayers();
  const bonusPoints = await getBonusPoints();

  return <BonusPointsPage initBonusPoints={bonusPoints} players={players} />;
}
