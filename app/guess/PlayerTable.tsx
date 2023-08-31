import { CheckCircleOutline } from '@mui/icons-material';

import React from 'react';

import { getFinishedPlayers } from "./action";

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

import { blue, green } from '@mui/material/colors';

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
  const [finishedPlayers, setFinishedPlayers] = React.useState<PlayerId[]>([]);

  React.useEffect(() => {
    // We need to insulate the async call from the component
    const callback = async () => {
      const ret = await getFinishedPlayers();
      setFinishedPlayers(ret);
    };

    callback();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableBody>
          {players.map(({ id: playerId, name }) => (
            <PlayerTableRow key={playerId} onClick={() => handleClick(playerId)}>
              <TableCell sx={{ width: '2rem', justifyContent: 'center' }}> { finishedPlayers.includes(playerId) ? <CheckCircleOutline sx={{ color: green[900], verticalAlign: 'middle' }} /> : '' } </TableCell>
              <TableCell sx={{ pl: 0 }} > <Typography sx={{ fontSize: '1.75rem' }} > {name} </Typography> </TableCell>
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
