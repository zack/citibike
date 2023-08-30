import GuessPage from './GuessPage';

import React from "react";

import { getFacts, getPlayers } from "./action";

export default async function Players() {
  const players = await getPlayers();
  const facts = await getFacts();

  return <GuessPage players={players} facts={facts}/>;
}
