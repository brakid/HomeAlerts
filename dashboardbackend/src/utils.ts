export const merge = <T>(values: T[], value: T, maxLength: number = 10): T[] => {
  const newValues = [...values];
  if (newValues.length >= maxLength) {
    newValues.shift();
  }
  newValues.push(value);
  return newValues;
};

export const parseAs = <T>(value: string): T => {
  return JSON.parse(value) as T;
};