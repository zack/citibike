"use client";

import React from "react";

import { styled } from "@mui/system";
import {
  Alert,
  Box,
  Container,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { Delete } from "@mui/icons-material";

import { createPlayer, getPlayers, deletePlayer } from "./action";

type PlayerName = string;
type PlayerId = number;

type Player = {
  name: PlayerName;
  id: PlayerId;
};

type AppProps = {
  initPlayers: Player[];
};

export default function PlayersList({ initPlayers }: AppProps) {
  const [players, setPlayers] = React.useState<Player[]>(initPlayers);
  const [playerName, setPlayerName] = React.useState("");
  const [isError, setIsError] = React.useState(false);
  const [nameIsInvalid, setNameIsInvalid] = React.useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (nameIsInvalid) {
      return;
    }

    const pendingId = Date.now();
    const pendingPlayer: Player = {
      name: playerName,
      id: pendingId,
    };
    setPlayerName("");

    setPlayers([...players, pendingPlayer]);

    try {
      const ret = await createPlayer(pendingPlayer.name);
      let foundPendingPlayer = false;

      // Replace the pending player with the one we get back from the database
      setPlayers([...players.filter((p) => p.id !== pendingId), ret]);
    } catch {
      setIsError(true);
      setPlayers(players.filter((p) => p.id !== pendingPlayer.id));
    }
  };

  const handleDelete = async (id: number) => {
    const pendingDeletedPlayer: Player | undefined = players.find(
      (p) => p.id === id,
    );

    if (pendingDeletedPlayer === undefined) {
      return;
      setIsError(true);
    }

    const newPlayers = players.filter((p) => p.id !== id);

    setPlayers(newPlayers);

    try {
      await deletePlayer(id);
    } catch {
      setIsError(true);
      // This looks very weird, but is necessary in the case that the error
      // comes back before the (asynchronous) `setPlayers` call is handled by
      // React. Otherwise we'll end up with a duplicate.
      setPlayers([...players.filter((p) => p.id !== id), pendingDeletedPlayer]);
    }
  };

  const handleSnackbarClose = () => {
    setIsError(false);
  };

  const validatePlayerName = (name: PlayerName) => {
    setNameIsInvalid(players.some((p) => p.name === name));
  };

  const sortedPlayers = players.toSorted((a, b) => (a.name > b.name ? 1 : 0));

  return (
    <main>
      <Container maxWidth="md">
        <h1>Player List</h1>

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              error={nameIsInvalid}
              sx={{ pb: 2 }}
              id="outlined-required"
              label="Player Name"
              value={playerName}
              onChange={(event) => {
                setPlayerName(event.target.value);
                validatePlayerName(event.target.value);
              }}
            />
          </form>

          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                {sortedPlayers.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell> {player.name} </TableCell>
                    <TableCell align="right">
                      <button onClick={() => handleDelete(player.id)}>
                        <Delete />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      <Snackbar
        open={isError}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="error"
          sx={{ width: "100%" }}
        >
          Uh oh! Something went wrong. Your change was not saved.
        </Alert>
      </Snackbar>
    </main>
  );
}
