"use client";

import React from "react";

import { createBonusPoints } from './action';

import { exoFontFamily } from '../ThemeProvider';

import { styled } from '@mui/system';

import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

interface BonusPointWithPlayerName extends BonusPoint {
  player: { name: string };
}

export default function GuessPage({ initBonusPoints, players } : { initBonusPoints: BonusPointWithPlayerName[], players: Player[] }) {
  const [playerName, setPlayerName] = React.useState('');
  const [points, setPoints] = React.useState(1);
  const [reason, setReason] = React.useState('');
  const [bonusPoints, setBonusPoints] = React.useState(initBonusPoints);

  const playerNames = ["", ...players.map(p => p.name)];

  const handlePlayerChange = (_event: unknown, newValue: string | null) => {
    setPlayerName(newValue ?? '');
  }

  const handlePointsChange = (value: string | number) => {
    const parsedValue = parseInt(`${value}`, 10);
    if (typeof parsedValue === 'number') {
      setPoints(parsedValue);
    } else {
      setPoints(1);
    }
  }

  const handleSubmit = () => {
    console.log('a');
    const playerId = players.find(p => p.name === playerName)?.id;

    if (playerId === undefined) {
      // this really should never happen
      return;
    }

    console.log({ playerId, reason, points });
    createBonusPoints(playerId, reason, points);
    setBonusPoints([
      ...bonusPoints,
      { id: Date.now(), playerId, player: { name: playerName }, reason, points }
    ].sort((a,b) => a.player.name > b.player.name ? 1 : -1));

    setPlayerName('');
    setPoints(1);
    setReason('');
  };


  return (
    <main>
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" sx={{ fontFamily: exoFontFamily, pb: 2 }} >
          Bonus Points
        </Typography>

        <Box sx={{ display: 'flex', pb: 2 }}>
          <Autocomplete
            sx={{ flexGrow: 2, pr: 2 }}
            id="player"
            options={playerNames}
            value={playerName}
            onChange={handlePlayerChange}
            renderInput={(p) => <TextField {...p} label="Player" />}
            renderOption={(props, option) => {
              return (
                <li {...props} key={option}>
                  {option}
                </li>
              );
            }}
            renderTags={(tagValue, getTagProps) => {
              return tagValue.map((option, index) => (
                <Chip {...getTagProps({ index })} key={option} label={option} />
              ))
            }}
          />

          <FormControl>
            <InputLabel id="points"> Points </InputLabel>
            <Select
              sx={{ minWidth: '100px' }}
              labelId="points"
              id="points"
              value={points}
              label="Points"
              onChange={(e) => handlePointsChange(e.target.value)}
            >
              {[1,2,3].map(i => (
                <MenuItem value={i} key={i}> {i} </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex' }}>
          <TextField
            sx={{ flexGrow: 2, pr: 2 }}
            id="reason"
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <Button variant="contained" onClick={handleSubmit}> Do it </Button>
        </Box>

        <Paper sx={{ mt: 2, p: 2 }}>
          {bonusPoints.length > 0 ?
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell> Name </TableCell>
                  <TableCell> Points </TableCell>
                  <TableCell> Reason </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {bonusPoints.map(bonus => (
                  <StyledTableRow key={bonus.id}>
                    <TableCell> {bonus.player.name} </TableCell>
                    <TableCell> {bonus.points} </TableCell>
                    <TableCell> {bonus.reason} </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
            :
            <Typography> You should give someone some bonus points. </Typography>
          }
        </Paper>
      </Container>
    </main>
  );
}

const StyledTableRow = styled(TableRow)({
  ['&:last-child']: {
    'td': {
      border: 0,
    },
  },
});
