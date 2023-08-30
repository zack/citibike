import PlayersList from "./PlayersList";

import React from "react";

import { getPlayers } from "./action";

export default async function Players() {
  const players = await getPlayers();
  return <PlayersList initPlayers={players} />;
}
