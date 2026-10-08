import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

if (!secret || secret.length < 32) {
  throw new Error(
    "JWT_SECRET environment variable must be set and at least 32 characters long"
  );
}

export interface TokenPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, secret, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded as TokenPayload;
  } catch {
    return null;
  }
}
