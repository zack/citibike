import React from "react";

import PlayersList from "./PlayersList";

import { getPlayers } from "./action";

export default async function Players() {
  const players = await getPlayers();
  return <PlayersList initPlayers={players} />;
}
