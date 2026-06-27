import CryptoJS from 'crypto-js';
import { ApiError } from './app-error';

/**
 * @returns Shared AES secret configured through environment variables.
 */
export function getAesSecret(): string {
  const secret = process.env.E2EE_SECRET;

  if (!secret) {
    throw new ApiError(500, 'Thieu E2EE_SECRET de xu ly ma hoa AES', 'E2EE_SECRET_MISSING');
  }

  return secret;
}

/**
 * @param plainText Plain text value to encrypt.
 * @param secret Optional override secret.
 * @returns AES-encrypted base64 string.
 */
export function encryptAES(plainText: string, secret = getAesSecret()): string {
  return CryptoJS.AES.encrypt(plainText, secret).toString();
}

/**
 * @param cipherText AES-encrypted string.
 * @param secret Optional override secret.
 * @returns Decrypted plain text string.
 */
export function decryptAES(cipherText: string, secret = getAesSecret()): string {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, secret);
    const plainText = bytes.toString(CryptoJS.enc.Utf8);

    if (!plainText) {
      throw new Error('Empty decrypted payload');
    }

    return plainText;
  } catch (error) {
    throw new ApiError(400, 'Khong the giai ma du lieu AES', 'INVALID_AES_PAYLOAD', {
      reason: error instanceof Error ? error.message : 'Unknown decryption error',
    });
  }
}
