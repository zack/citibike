import React from 'react';

import { getFactIdsOfFalseGuessesForPlayer } from './action';

import { red } from '@mui/material/colors';

import { styled } from "@mui/system";

import { submitGuesses } from './action';

import {
  Alert,
  Button,
  Checkbox,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

type GuessTableProps = {
  facts: Fact[];
  playerId: PlayerId;
  onSubmit: () => void;
};

export default function GuessTable({ facts, playerId, onSubmit }: GuessTableProps) {
  const [isError, setIsError] = React.useState(false);
  const [selectedFacts, setSelectedFacts] = React.useState<FactId[]>([])
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    // We need to insulate the async call from the component
    const callback = async () => {
      const factIds = await getFactIdsOfFalseGuessesForPlayer(playerId);
      setSelectedFacts(factIds);
    };

    callback();
  }, [playerId]);

  const handleLockIn = async () => {
    const guesses = facts.map((fact) => ({
      factId: fact.id,
      guess: !selectedFacts.includes(fact.id),
    }));

    try {
      setSubmitted(true);
      await submitGuesses(playerId, guesses);
      onSubmit();
    } catch {
      setIsError(true);
      setSubmitted(false);
    }
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

    if (guessCount !== requiredCount) {
      return (
        <Typography fontSize='1.25rem' height='2.1rem'>
          You have marked <Typography component={'span'} fontSize='1.5rem' sx={{ color: 'red' }}>{guessCount}/{requiredCount}</Typography> facts as false
        </Typography>
      );
    } else {
      return (
        <Button
          disabled={submitted}
          variant="contained"
          color="success"
          sx={{ height: '2.1rem' }}
          onClick={handleLockIn}
        >
          Perfect! Click here to lock it in.
        </Button>
      );
    }
  }

  return (
    <>
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
                {index + 1}.
              </TableCell>

              <TableCell>
                <Typography sx={{ fontSize: '1.75rem' }} > {content} </Typography>
              </TableCell>

              <TableCell>
                <RedCheckbox checked={selectedFacts.includes(id)} />
              </TableCell>
            </FactTableRow>
          ))}
          <TableRow>
            <TableCell />
            <TableCell align="center">
              { guessCountText() }
            </TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>

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
        Uh oh! Something went wrong. Your change was not saved.
      </Alert>
    </Snackbar>
    </>
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
