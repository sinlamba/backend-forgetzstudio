export const calculateTokenExpiresAt = (expiresIn: number): Date => {
  return new Date(Date.now() + expiresIn * 1000);
};