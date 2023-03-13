export const merge = <T>(values: T[], value: T, maxLength: number = 10): T[] => {
  const newValues = [...values];
  if (newValues.length >= maxLength) {
    newValues.shift();
  }
  newValues.push(value);
  return newValues;
};

export const formatDigit = (digit: number): string => {
  return ('0' + digit).slice(-2);
}

export const formatDate = (date: Date): string => {
  return formatDigit(date.getHours()) + ':' + formatDigit(date.getMinutes()) + ':' + formatDigit(date.getSeconds());
};