import React from "react";

import ScorePage from './ScorePage';


import { getFacts, getGuesses, getPlayers } from "./action";

export default async function Score() {
  const players = await getPlayers();
  const facts = await getFacts();
  const guesses = await getGuesses();

  return <ScorePage players={players} facts={facts} guesses={guesses}/>;
}
