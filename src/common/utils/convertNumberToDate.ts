export const convertNumberToDate = (expiresIn: number): Date => {
  return new Date(Date.now() + expiresIn * 1000);
};