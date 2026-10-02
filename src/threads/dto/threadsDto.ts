import { IsISO8601, IsOptional, IsString } from "class-validator";

export class threadsPostDto {
  @IsString()
  videoUrl!: string;
  @IsString()
  caption!: string;
  @IsString()
  audioName!: string;
  
  @IsOptional()
  @IsISO8601()
  scheduledAt!: string;
}