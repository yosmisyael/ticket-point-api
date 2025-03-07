import * as crypto from 'crypto';

export function generateOtp(size: number = 6): string {
  const max: number = Math.pow(10, size);
  const randomNumber: number = crypto.randomInt(0, max);
  return randomNumber.toString().padStart(size, '0');
}