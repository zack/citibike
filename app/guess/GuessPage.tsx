"use client";

import GuessTable from "./GuessTable";

import PlayerTable from "./PlayerTable";

import React from "react";

import { exoFontFamily } from '../ThemeProvider';

import {
  Box,
  Button,
  Container,
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

  const selectPlayer = (id: PlayerId) => {
    setSelectedPlayer(id);
  }

  const getTitle = () => {
    if (selectedPlayer === undefined) {
      return 'Select Player';
    } else {
      const selectedPlayerName = players.find(p => p.id === selectedPlayer)?.name;
      return `Select Guesses for ${selectedPlayerName}`;
    }
  }

  const handleSubmitGuesses = () => {
    // conditional keeps typescript happy. It shouldn't ever matter.
    if (selectedPlayer !== undefined) {
      setSelectedPlayer(undefined);
    }
  }

  return (
    <main>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontFamily: exoFontFamily, pb: 2 }} >
            {getTitle()}
          </Typography>
          { selectedPlayer !== undefined ? <Button variant="contained" onClick={handleSubmitGuesses}> Back </Button> : null }
        </Box>

        {
          selectedPlayer === undefined
          ? <PlayerTable players={players} handleClick={selectPlayer}/>
          : <GuessTable facts={facts} playerId={selectedPlayer} onSubmit={handleSubmitGuesses}/>
        }
      </Container>
    </main>
  );
}
