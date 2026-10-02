import { IsISO8601, IsOptional } from "class-validator";

export class InstagramPostDTO {
  videoUrl!: string;
  caption!: string;
  audioName!: string;

  @IsOptional()
  @IsISO8601()
  scheduled?: string;
}