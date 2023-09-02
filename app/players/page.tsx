import type { Metadata } from "next";

import PlayersList from "./PlayersList";

import React from "react";

import { getPlayers } from "./action";

export const metadata: Metadata = {
  title: "Players Management | Facts Party",
};

export default async function Players() {
  const players = await getPlayers();
  return <PlayersList initPlayers={players} />;
}
