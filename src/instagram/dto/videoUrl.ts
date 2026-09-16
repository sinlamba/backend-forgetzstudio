import { IsString, IsUrl } from "class-validator";

export class SaveVideoUrlDto {
    @IsString()
    @IsUrl()
    videoUrl!: string;
}