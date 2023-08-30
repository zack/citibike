"use client";

import { Delete } from "@mui/icons-material";

import React from "react";

import { exoFontFamily } from '../ThemeProvider';

import { produce } from "immer";

import { styled } from "@mui/system";

import {
  Alert,
  Button,
  Container,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import {
  createPlayer,
  deletePlayer,
  updateFactContent,
} from "./action";

type FactId = number;

type PlayerName = string;
type PlayerId = number;

type Fact = {
  id: FactId;
  real: boolean;
  content: string;
  playerId: PlayerId;
}

type Player = {
  name: PlayerName;
  id: PlayerId;
  facts: Fact[];
};

type PlayersListProps = {
  initPlayers: Player[];
};

export default function PlayersList({ initPlayers }: PlayersListProps) {
  const [players, setPlayers] = React.useState<Player[]>(initPlayers);
  const [playerName, setPlayerName] = React.useState("");
  const [isGenericError, setIsGenericError] = React.useState(false);
  const [isNameError, setIsNameError] = React.useState(false);
  const [nameIsInvalid, setNameIsInvalid] = React.useState(false);
  const [openPlayerId, setOpenPlayerId] = React.useState<PlayerId|undefined>(undefined);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (nameIsInvalid) {
      setIsNameError(true);
      return;
    }

    const pendingId = Date.now();
    const pendingPlayer: Player = {
      name: playerName,
      id: pendingId,
      facts: [],
    };
    setPlayerName("");

    setPlayers([...players, pendingPlayer]);

    try {
      const ret = await createPlayer(pendingPlayer.name);

      // Replace the pending player with the one we get back from the database
      setPlayers(playerState => [...playerState.filter((p) => p.id !== pendingId), ret ]);
    } catch {
      setIsGenericError(true);
      setPlayers(playerState => playerState.filter((p) => p.id !== pendingPlayer.id));
    }
  };

  const handleDelete = async (id: number) => {
    const pendingDeletedPlayer: Player | undefined = players.find(
      (p) => p.id === id,
    );

    if (pendingDeletedPlayer === undefined) {
      setIsGenericError(true);
      return;
    }


    setPlayers(playerState => playerState.filter((p) => p.id !== id));

    try {
      await deletePlayer(id);
    } catch {
      setIsGenericError(true);
      // This looks very weird, but is necessary in the case that the error
      // comes back before the (asynchronous) `setPlayers` call is handled by
      // React. Otherwise we'll end up with a duplicate.
      setPlayers(playerState => [...playerState.filter((p) => p.id !== id), pendingDeletedPlayer]);
    }
  };

  const handleRowClick = (id: PlayerId) => {
    // Don't open pending players
    if (openPlayerId === id && id < 9999) {
      setOpenPlayerId(undefined);
    } else {
      setOpenPlayerId(id);
    }
  };

  const validatePlayerName = (name: PlayerName) => {
    setNameIsInvalid(players.some((p) => p.name === name));
  };

  const handleFactChange = (id: FactId, playerId: PlayerId, content: string) => {
    // Find and update this one specific fact
    setPlayers(
      produce((draft) => {
        draft.map((player: Player) => {
          if (player.id === playerId) {
            player.facts.map((fact) => {
              if (fact.id === id) {
                fact.content = content;
              }
            });
          }
        });
      })
    );

    updateFactContent(id, content);
  };

  const renderFactCountTableCell = (facts: Fact[]) => {
    const factsCount = facts.filter((f: Fact) => f.content !== '').length;

    return (
      <FactCountTableCell sx={{ width: '10%' }} iserror={`${factsCount < 3}`}>
        <Typography sx={{ fontSize: '1.25rem' }} >
          {factsCount}/3
        </Typography>
      </FactCountTableCell>
    );
  };

  const sortedPlayers = [...players].sort((a, b) => (a.name > b.name ? 1 : 0));

  return (
    <main>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" sx={{ fontFamily: exoFontFamily, pb: 2 }} >
          Players
        </Typography>

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              error={nameIsInvalid}
              sx={{ pb: 2 }}
              id="outlined-required"
              label="New Player Name"
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
                {sortedPlayers.map(({ id: playerId, name, facts }) => (
                  <React.Fragment key={playerId}>
                    <PlayerTableRow onClick={() => handleRowClick(playerId)}>
                      {renderFactCountTableCell(facts)}
                      <TableCell> <Typography sx={{ fontSize: '1.75rem' }} > {name} </Typography> </TableCell>
                      <TableCell className="delete-player" align="right">
                        <Button
                          sx = {{
                            'minWidth': '30px',
                            'width': '30px',
                            'padding': '8px 23px',
                          }}
                          variant="contained"
                          onClick={() => handleDelete(playerId)}
                          disabled={playerId > 9999} // player is pending
                        >
                          <Delete />
                        </Button>
                      </TableCell>
                    </PlayerTableRow>

                    {/* fact rows */}
                    { (playerId === openPlayerId) ? (
                      facts.map((fact: Fact) => (
                        <TableRow key={fact.id}>
                          <TableCell />
                          <TableCell colSpan={2}>
                            <TextField
                              color={fact.real ? "success" : "error"}
                              focused
                              size="small"
                              label={fact.real ? "true" : "false" }
                              id={`fact-${fact.id}`}
                              sx={{ width: '100%' }}
                              value={fact.content}
                              onChange={(event) => {
                                handleFactChange(fact.id, playerId, event.target.value);
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : null }
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      <Snackbar
        open={isGenericError}
        autoHideDuration={3000}
        onClose={() => setIsGenericError(false)}
      >
        <Alert
          onClose={() => setIsGenericError(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          Uh oh! Something went wrong. Your change was not saved.
        </Alert>
      </Snackbar>

      <Snackbar
        open={isNameError}
        autoHideDuration={3000}
        onClose={() => setIsNameError(false)}
      >
        <Alert
          onClose={() => setIsNameError(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          That name is already taken. Pick something else!
        </Alert>
      </Snackbar>
    </main>
  );
}

const PlayerTableRow = styled(TableRow)({
  '&:hover': {
    'backgroundColor': '#E3F2FD',
    'cursor': 'pointer',
  },
});

const FactCountTableCell = styled(TableCell)(({ iserror }: { iserror: string }) => ({
  color: iserror === 'true' ? '#FF0000' : '#000',
}));

