export interface JwtPayload {
  sub: string;  // User ID
  email: string;
  iat?: number; // Issued at
  exp?: number; // Expiration
}
