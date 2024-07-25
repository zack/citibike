function isBorough(value: string) {
  return (
    value === 'Bronx'
    || value === 'Brooklyn'
    || value === 'Manhattan'
    || value === 'Queens'
  );
}

export { isBorough };
