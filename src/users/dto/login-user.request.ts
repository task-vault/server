import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserRequest {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsBoolean()
  @IsNotEmpty()
  shouldRemember: boolean;
}
