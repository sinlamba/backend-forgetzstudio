import { IsEmail, IsString, IsStrongPassword } from 'class-validator';



export class testDto {
  @IsString()
 name!: string


 @IsString()
 userId!: string
}