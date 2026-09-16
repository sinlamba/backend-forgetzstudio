import {  IsDateString, IsString } from "class-validator";


export class InstagramPostDTO {
    @IsString()
    videoUrl! : string

    @IsString()
    caption! : string

    @IsString() 
    audioName! : string

    @IsDateString() 
    schedule!: string
}