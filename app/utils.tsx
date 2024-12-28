import { Borough } from './action';

function isBorough(value: string): value is Borough {
  return ['Bronx', 'Brooklyn', 'Manhattan', 'Queens'].includes(
    value as Borough,
  );
}

export { isBorough };
