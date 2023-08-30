import React from 'react';

import { red } from '@mui/material/colors';

import { styled } from "@mui/system";

import {
  Button,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

type FactId = number;
type PlayerId = number;
type Fact = {
  id: FactId;
  real: boolean;
  content: string;
  playerId: PlayerId;
}

type GuessTableProps = {
  facts: Fact[];
};

export default function GuessTable({ facts }: GuessTableProps) {
  const [selectedFacts, setSelectedFacts] = React.useState<FactId[]>([]);

  const handleLockIn = () => {
    console.log('Locking it in');
  }

  const handleClick = (id: FactId) => {
    if (selectedFacts.includes(id)) {
      setSelectedFacts(state => state.filter(i => i !== id));
    } else {
      setSelectedFacts(state => [...state, id])
    }
  }

  const guessCountText = () => {
    const guessCount = selectedFacts.length;
    const requiredCount = facts.length/3;
    const color = guessCount === requiredCount ? 'green' : 'red';

    if (guessCount !== requiredCount) {
      return (
        <Typography fontSize='1.25rem' height='2.1rem'>
          You have marked <Typography component={'span'} fontSize='1.5rem' sx={{ color: 'red' }}>{guessCount}/{requiredCount}</Typography> facts as false
        </Typography>
      );
    } else {
      return (
        <Button variant="contained" color="success" sx={{ height: '2.1rem' }} > Perfect! Click here to lock it in. </Button>
      );
    }
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell> # </TableCell>
            <TableCell align="center">
              { guessCountText() }
            </TableCell>
            <TableCell> False? </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {facts.map(({ id, content }, index) => (
            <FactTableRow key={id}  onClick={() => handleClick(id)} isselected={`${selectedFacts.includes(id)}`}>
              <TableCell>
                {index}.
              </TableCell>

              <TableCell>
                <Typography sx={{ fontSize: '1.75rem' }} > {content} </Typography>
              </TableCell>

              <TableCell>
                <RedCheckbox checked={selectedFacts.includes(id)} />
              </TableCell>
            </FactTableRow>
          ))}
        </TableBody>
        <TableRow>
          <TableCell />
            <TableCell align="center">
              { guessCountText() }
            </TableCell>
          <TableCell />
        </TableRow>
      </Table>
    </TableContainer>
  );
}

const FactTableRow = styled(TableRow)(({ isselected }: { isselected: string }) => ({
  backgroundColor: isselected === 'true' ? red[200] : 'white',
  '&:hover': {
    backgroundColor: isselected === 'true' ? red[300] : red[100],
    cursor: 'pointer',
  },
}));

const RedCheckbox = styled(Checkbox)({
  color: 'black',
  '&.Mui-checked': {
    color: 'black',
  },
});
