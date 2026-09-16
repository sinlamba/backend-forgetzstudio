import { IsEmail, IsString, IsStrongPassword } from 'class-validator';



export class RegisterDTO {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsStrongPassword()
  password!: string;
}