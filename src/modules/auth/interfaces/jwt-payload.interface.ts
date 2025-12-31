export interface JwtPayload {
  userId: string;
  email: string;
  app: string;
  ownerType: string;
  roles: string[];
  permissions: string[];
}
