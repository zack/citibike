"use client";

import React from "react";

import GuessTable from "./GuessTable";
import PlayerTable from "./PlayerTable";

import { exoFontFamily } from '../ThemeProvider';

import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";

type PlayerName = string;
type PlayerId = number;
type Player = {
  name: PlayerName;
  id: PlayerId;
};

type FactId = number;
type Fact = {
  id: FactId;
  real: boolean;
  content: string;
  playerId: PlayerId;
}

type GuessPageProps = {
  facts: Fact[];
  players: Player[];
};

export default function GuessPage({ facts, players }: GuessPageProps) {
  const [selectedPlayer, setSelectedPlayer] = React.useState<PlayerId | undefined>(undefined);

  const handleRowClick = (id: PlayerId) => {
    console.log({ id });
  };

  const selectPlayer = (id: PlayerId) => {
    setSelectedPlayer(id);
  }

  const getTitle = () => {
    if (selectedPlayer === undefined) {
      return 'Select Player';
    } else {
      return 'Select Your Guesses';
    }
  }

  return (
    <main>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" sx={{ fontFamily: exoFontFamily, pb: 2 }} >
          {getTitle()}
        </Typography>

        {
          selectedPlayer === undefined
          ? <PlayerTable players={players} handleClick={selectPlayer}/>
          : <GuessTable facts={facts} />
        }
      </Container>
    </main>
  );
}
