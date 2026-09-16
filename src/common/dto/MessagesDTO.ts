import { IsEmail, IsString, IsStrongPassword } from 'class-validator';






export class MessagesDTO {
  @IsString()
  to!: string
  
  
  @IsString()
  subject!: string
  
  
  @IsString()
  body?: string
  
  
}
