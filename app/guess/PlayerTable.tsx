import { blue } from '@mui/material/colors';

import React from 'react';

import { styled } from "@mui/system";

import {
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

type PlayerTableProps = {
  handleClick: (id: PlayerId) => void;
  players: Player[];
};

export default function PlayerTable({ handleClick, players }: PlayerTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableBody>
          {players.map(({ id: playerId, name }) => (
            <PlayerTableRow key={playerId} onClick={() => handleClick(playerId)}>
              <TableCell> <Typography sx={{ fontSize: '1.75rem' }} > {name} </Typography> </TableCell>
            </PlayerTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const PlayerTableRow = styled(TableRow)({
  '&:hover': {
    'backgroundColor': blue[200],
    'cursor': 'pointer',
  },
});
