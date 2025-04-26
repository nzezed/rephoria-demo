import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  [key: string]: any;
}

export function generateToken(payload: TokenPayload, expiresIn: string = '1h'): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string): TokenPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  try {
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
} 