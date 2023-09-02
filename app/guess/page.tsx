import GuessPage from './GuessPage';

import type { Metadata } from "next";

import React from "react";

import { getFacts, getPlayers } from "./action";

export const metadata: Metadata = {
  title: "Player Guessing | Facts Party",
};

export default async function Players() {
  const players = await getPlayers();
  const facts = await getFacts();

  return <GuessPage players={players} facts={facts}/>;
}
