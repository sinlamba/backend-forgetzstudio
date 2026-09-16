import { Injectable } from "@nestjs/common";
import { AiService } from "../ai/ai.service";
import { StateAnnotation } from "../graph/state";



@Injectable()

export class ValidatorLLM{
 

    constructor(private readonly AiService: AiService) {}


    async execute(state : typeof StateAnnotation.State) {

    }


}