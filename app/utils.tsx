import { Borough } from './types';

function isBorough(value: string): value is Borough {
  return ['Bronx', 'Brooklyn', 'Manhattan', 'Queens'].includes(
    value as Borough,
  );
}

function getQueryString(params: Record<string, string>) {
  return new URLSearchParams(params).toString();
}

export { getQueryString, isBorough };
