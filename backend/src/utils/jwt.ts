import jwt, { SignOptions } from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * Generate access token (short-lived)
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRATION || '15m') as string | number,
  } as SignOptions);
};

/**
 * Generate refresh token (long-lived)
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d') as string | number,
  } as SignOptions);
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET as string
  ) as TokenPayload;
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = (payload: TokenPayload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};
