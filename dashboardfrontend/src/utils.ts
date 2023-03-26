export const formatDigit = (digit: number): string => {
  return ('0' + digit).slice(-2);
}

export const formatDate = (date: Date): string => {
  return formatDigit(date.getHours()) + ':' + formatDigit(date.getMinutes()) + ':' + formatDigit(date.getSeconds());
};