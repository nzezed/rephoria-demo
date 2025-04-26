import jwt, { SignOptions, Secret } from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  [key: string]: any;
}

export function generateToken(payload: TokenPayload, expiresIn: SignOptions['expiresIn'] = '1h'): string {
  const secret = process.env.JWT_SECRET as Secret;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, secret, options);
}

export function verifyToken(token: string): TokenPayload {
  const secret = process.env.JWT_SECRET as Secret;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  try {
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
} 