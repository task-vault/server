export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  refreshToken: string | null;
  created_at: Date;
  updated_at: Date;
};
