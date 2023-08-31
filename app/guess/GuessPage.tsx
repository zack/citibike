"use client";

import FactTable from "./FactTable";

import GuessTable from "./GuessTable";

import PlayerTable from "./PlayerTable";

import React from "react";

import { exoFontFamily } from '../ThemeProvider';

import {
  Alert,
  Box,
  Button,
  Container,
  Snackbar,
  Typography,
} from "@mui/material";

type GuessPageProps = {
  facts: Fact[];
  players: Player[];
};

type Page = 'playerSelect' | 'truthSelect' | 'lieSelect' | 'guessTable';

export default function GuessPage({ facts, players }: GuessPageProps) {
  const [isError, setIsError] = React.useState(false);
  const [page, setPage] = React.useState<Page>('playerSelect');
  const [selectedPlayer, setSelectedPlayer] = React.useState<PlayerId | undefined>(undefined);
  const [selectedTruths, setSelectedTruths] = React.useState<FactId[]>([]);

  React.useEffect(() => {
    // Always scroll to the top when changing the page
    window.scrollTo(0,0);
  }, [page]);

  const selectPlayer = (id: PlayerId) => {
    setSelectedPlayer(id);
    setPage('truthSelect');
  }

  const setTruths = (ids: FactId[]) => {
    setSelectedTruths(ids);
    setPage('lieSelect');
  }

  const setLie = (ids: FactId[]) => {
    const [id] = ids;

    // Pass the lie id right in since state wouldn't be updated before this runs
    if (authenticationChoicesAreValid(id)) {
      setPage('guessTable');
    } else {
      setIsError(true);
      setSelectedTruths([]);
      setSelectedPlayer(undefined);
      setPage('playerSelect');
    }
  }

  const getTitle = () => {
    const selectedPlayerName = players.find(p => p.id === selectedPlayer)?.name;

    switch (page) {
      case 'playerSelect':
        return 'Select Player';
      case 'truthSelect':
        return `Select ${selectedPlayerName}'s Two TRUE Facts`;
      case 'lieSelect':
        return `Select ${selectedPlayerName}'s LIE`;
      case 'guessTable':
        return `Select Final Guesses for ${selectedPlayerName}`;
    }
  }

  const authenticationChoicesAreValid = (selectedLie: FactId) => {
    const playersFacts = facts.filter(f => f.playerId === selectedPlayer);
    const playersTruths = playersFacts.filter(f => f.real === true).map(f => f.id);
    const playersLies = playersFacts.filter(f => f.real === false).map(f => f.id);

    return (
      playersLies[0] === selectedLie
      && playersTruths.includes(selectedTruths[0])
      && playersTruths.includes(selectedTruths[1])
    );
  }

  const returnToFirstPage = () => {
      setSelectedTruths([]);
      setSelectedPlayer(undefined);
      setPage('playerSelect');
  }

  const handleBack = () => {
    if (page === 'guessTable') {
      returnToFirstPage();
    } else if (page === 'lieSelect') {
      setPage('truthSelect');
    } else if (page === 'truthSelect') {
      setSelectedTruths([]);
      setPage('playerSelect');
    }
  }

  return (
    <main>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontFamily: exoFontFamily, pb: 2 }} >
            {getTitle()}
          </Typography>
          { selectedPlayer !== undefined ? <Button variant="contained" onClick={handleBack}> Back </Button> : null }
        </Box>

        { page === 'playerSelect' ? <PlayerTable players={players} handleClick={selectPlayer}/> : null }
        { page === 'truthSelect' ? <FactTable facts={facts} onSubmit={setTruths} count={2} /> : null }
        { page === 'lieSelect' ? <FactTable facts={facts} onSubmit={setLie} count={1} /> : null }
        { page === 'guessTable' && selectedPlayer !== undefined ? <GuessTable facts={facts} playerId={selectedPlayer} onSubmit={returnToFirstPage}/> : null }

        <Snackbar
          open={isError}
          autoHideDuration={3000}
          onClose={() => setIsError(false)}
        >
          <Alert
            onClose={() => setIsError(false)}
            severity="error"
            sx={{ width: "100%" }}
          >
            Sorry, that wasn&apos;t right...
          </Alert>
        </Snackbar>
      </Container>
    </main>
  );
}
