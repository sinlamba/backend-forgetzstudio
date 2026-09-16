import { IsEmail, IsString, IsStrongPassword } from 'class-validator';


export class UserDTO {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsStrongPassword()
  password!: string;
}