"use client";

import React from "react";

import { produce } from "immer";

import { styled } from "@mui/system";

import {
  Alert,
  Container,
  Paper,
  Snackbar,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
} from "@mui/material";

import {
  Delete,
  ReportProblem
} from "@mui/icons-material";

import {
  createPlayer,
  deletePlayer,
  setFact
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
  const [isError, setIsError] = React.useState(false);
  const [nameIsInvalid, setNameIsInvalid] = React.useState(false);
  const [openPlayerId, setOpenPlayerId] = React.useState<PlayerId|undefined>(undefined);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (nameIsInvalid) {
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
      setPlayers([...players.filter((p) => p.id !== pendingId), ret ]);
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
      setIsError(true);
      return;
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

  const handleRowClick = (id: PlayerId) => {
    // Don't open pending players
    if (openPlayerId === id && id < 9999) {
      setOpenPlayerId(undefined);
    } else {
      setOpenPlayerId(id);
    }
  };

  const handleSnackbarClose = () => {
    setIsError(false);
  };

  const validatePlayerName = (name: PlayerName) => {
    setNameIsInvalid(players.some((p) => p.name === name));
  };

  const handleFactToggle = async (id: FactId, playerId: PlayerId, real: boolean) => {
    let factContent = '';

    // Find and toggle this one specific fact
    setPlayers(
      produce((draft) => {
        draft.map((player: Player) => {
          if (player.id === playerId) {
            player.facts.map((fact) => {
              if (fact.id === id) {
                factContent = fact.content;
                fact.real = real;
              }
            });
          }
        });
      })
    );

    try {
      await setFact(id, factContent, real);
    } catch {
      setIsError(true);

      // Oops, revert it
      setPlayers(
        produce((draft) => {
          draft.map((player: Player) => {
            if (player.id === playerId) {
              player.facts.map((fact) => {
                if (fact.id === id) {
                  fact.real = !real;
                }
              });
            }
          });
        })
      );
    }
  };

  const handleFactChange = (id: FactId, playerId: PlayerId, content: string) => {
    let factReality = true;

    // Find and update this one specific fact
    setPlayers(
      produce((draft) => {
        draft.map((player: Player) => {
          if (player.id === playerId) {
            player.facts.map((fact) => {
              if (fact.id === id) {
                factReality = fact.real;
                fact.content = content;
              }
            });
          }
        });
      })
    );

    setFact(id, content, factReality);
  };

  const renderFactCountTableCell = (facts: Fact[]) => {
    const factsCount = facts.filter((f: Fact) => f.content !== '').length;
    const realFacts = facts.filter((f: Fact) => f.real === true).length;

    return (
      <FactCountTableCell sx={{ width: '10%' }} iserror={`${factsCount < 3}`}>
        {factsCount}/3
        {facts.length > 0 && realFacts !== 2 && // length == 0 => placeholder
        <ReportProblem
          sx={{
            color: '#FFCA28',
            height: '18px',
            width: '18px',
            transform: 'translate(4px,3px)'
          }}
        />
        }
      </FactCountTableCell>
    );
  };

  const sortedPlayers = [...players].sort((a, b) => (a.name > b.name ? 1 : 0));

  return (
    <main>
      <Container maxWidth="lg">
        <h1>Player List</h1>

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
                      <TableCell> {name} </TableCell>
                      <TableCell align="right">
                        <button
                          onClick={() => handleDelete(playerId)}
                          disabled={playerId > 9999} // player is pending
                        >
                          <Delete />
                        </button>
                      </TableCell>
                    </PlayerTableRow>

                    { (playerId === openPlayerId) ? (
                      facts.map((fact: Fact) => (
                        <TableRow key={fact.id}>
                          <TableCell>
                            <StyledSwitch
                              checked={fact.real}
                              onChange={() => handleFactToggle(fact.id, playerId, !fact.real)}
                            />
                          </TableCell>

                          <TableCell colSpan={2}>
                            <TextField
                              size="small"
                              label="fact"
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

const StyledSwitch = styled(Switch)({
  '& .MuiSwitch-switchBase': {
    color: "#B71C1C",
    '& + .MuiSwitch-track': {
      backgroundColor: "#E53935",
    },
    '&.Mui-checked': {
      color: "#1B5E20",
      '& + .MuiSwitch-track': {
        backgroundColor: "#43A047",
      },
    },
  },
});

const PlayerTableRow = styled(TableRow)({
  '&:hover': {
    'backgroundColor': '#E3F2FD',
    'cursor': 'pointer',
  },
});

const FactCountTableCell = styled(TableCell)(({ iserror }: { iserror: string }) => ({
  color: iserror === 'true' ? '#FF0000' : '#000',
}));

