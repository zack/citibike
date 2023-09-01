"use client";

import React from "react";

import { exoFontFamily } from '../ThemeProvider';

import {
  Box,
  Container,
  Typography,
} from "@mui/material";

import { green, red } from "@mui/material/colors";

type ScorePageProps = {
  facts: Fact[];
  players: Player[];
  guesses: Guess[];
}

function BigText({ children, size, color } : { children: React.ReactNode, size: string, color: string }) {
  return (
    <Typography component={'span'} fontSize={size} sx={{ color }}>
      {children}
    </Typography>
  );
}

function getPlayerName(playerId: PlayerId, players: Player[]) {
  return players.find(player => player.id === playerId)?.name;
}

type AuditProps = {
  problems: { [index: PlayerId]: { truth: number, lie: number } };
  players: Player[];
}
function Audit({ problems, players }: AuditProps) {
  return (
    <>
      <ul>
        {Object.keys(problems).map(playerId => {
          const id = parseInt(playerId, 10);
          return (
            <li key={playerId}>
              <Typography>
                Player {id} ({getPlayerName(id, players)}) has {problems[id].truth} Truth guesses and {problems[id].lie} Lie guesses
              </Typography>
            </li>
          );
        })}
      </ul>

      <Box sx={{ ml: 3 }}>
        <Typography>
          Everyone should have {players.length * 2} Truth guess and {players.length} Lie guesses.
        </Typography>
      </Box>
    </>
  );
}

function generateGuessAudit(guesses: Guess[], players: Player[]) {
  type Data = { [index: PlayerId]: { truth: number, lie: number } };
  const data: Data = {};

  guesses.forEach(guess => {
    const playerId = guess.playerId;

    if (!Object.hasOwn(data, playerId)) {
      data[playerId] = { truth: 0, lie: 0 };
    }

    if (guess.guess) {
      data[playerId].truth += 1;
    } else {
      data[playerId].lie += 1;
    }
  });

  type Problems = { [index: PlayerId]: { truth: number, lie: number } };
  const problems: Problems = {};

  Object.keys(data).forEach(key => {
    const playerId: PlayerId = parseInt(key, 10);

    const { truth, lie } = data[playerId]

    if ( truth !== (players.length * 2) || lie !== players.length ) {
      problems[playerId] = { truth, lie };
    }
  });

  return problems;
}


export default function GuessPage({ facts, players, guesses }: ScorePageProps) {
  const guessAudit = generateGuessAudit(guesses, players);
  const problems = Object.keys(guessAudit).length;

  return (
    <main>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" sx={{ fontFamily: exoFontFamily, pb: 2 }} >
          Scores
        </Typography>

        <Box>
          <Typography variant="h5" component="h2" sx={{ pb: 2 }} >
            You have <BigText size="2.25rem" color={green[900]}> {players.length} </BigText> players.
          </Typography>

          <Typography variant="h5" component="h2" sx={{ pb: 2 }} >
            You have <BigText size="2.25rem" color={green[900]}> {facts.length} </BigText> facts.
          </Typography>

          <Typography variant="h5" component="h2" sx={{ pb: 2 }} >
            You have <BigText size="2.25rem" color={green[900]}> {guesses.length} </BigText> guesses.
          </Typography>

          { problems > 0 ?
            <>
              <Typography variant="h5" component="h2" >
                You have <BigText size="2.25rem" color={red[900]}> {problems} </BigText> {problems === 1 ? 'problem' : 'problems'}:
              </Typography>
              < Audit problems={guessAudit} players={players} />
            </>
            : null }

          { problems === 0 ?
            <Typography variant="h5" component="h2" sx={{ pb: 2 }} >
              Everything looks good. Hit the big button.
            </Typography>
            : null }
        </Box>
      </Container>
    </main>
  );
}
