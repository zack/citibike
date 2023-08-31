import React from 'react';

import { blue } from '@mui/material/colors';

import { styled } from "@mui/system";

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
  onSubmit: (ids: FactId[]) => void;
  count: number,
};

export default function GuessTable({ facts, onSubmit, count }: GuessTableProps) {
  const [selectedFacts, setSelectedFacts] = React.useState<FactId[]>([])

  const handleClick = (id: FactId) => {
    if (count === 1) {
      onSubmit([id]);
    } else if (selectedFacts.includes(id)) {
      setSelectedFacts(state => state.filter(i => i !== id));
    } else if (count === selectedFacts.length + 1){
      onSubmit([...selectedFacts, id]);
    } else {
      setSelectedFacts(state => [...state, id])
    }
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell> # </TableCell>
              <TableCell></TableCell>
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
              </FactTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

const FactTableRow = styled(TableRow)(({ isselected }: { isselected: string }) => ({
  backgroundColor: isselected === 'true' ? blue[200] : 'white',
  '&:hover': {
    backgroundColor: isselected === 'true' ? blue[300] : blue[100],
    cursor: 'pointer',
  },
}));
