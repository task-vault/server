import { User, UserResponse } from '../interfaces/user';

export const formatUser = (user: User): UserResponse => {
  const formattedUser: UserResponse = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  return formattedUser;
};
