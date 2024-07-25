'use client';

import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';
import React from 'react';
import { Typography } from '@mui/material';

import styled from '@emotion/styled';
import { useQueryState } from 'nuqs';

export default function FAQButton() {
  const [faq, setFaq] = useQueryState('faq');

  return faq ? (
    <StyledButton onClick={() => setFaq(null)}>
      <CancelIcon /> <Typography> Back </Typography>
    </StyledButton>
  ) : (
    <StyledButton onClick={() => setFaq('open')}>
      <HelpIcon /> <Typography> FAQ </Typography>
    </StyledButton>
  );
}

const StyledButton = styled.button`
  background: white;
  border: 0;
  cursor: pointer;
  width: 70px;

  &:hover {
    border-radius: 5px;
    outline: 3px solid #0150b4;
    p {
      font-weight: bold;
    }
  }
`;
