import { BadRequestException, Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service";

import { gmailRepoPort } from "../port/gmailRepoPort";
import { saveTokens, saveTokensResult } from "../types/repo/common";
import { provider } from "../../common/types";


@Injectable()
export class gmailRepository implements gmailRepoPort {

    constructor(private readonly prisma: DatabaseService) { }


    async saveTokens(props: saveTokens): Promise<saveTokensResult> {


        const res = await this.prisma.PlatfromIntegration.create({
            data: {
                userId: props.userId,
                platfromAccountId: props.platfromUserId,
                provider: props.provider,
                accessToken: props.accessToken,
                refreshToken: props.refreshToken




            }
        })


        return {
            userId: res.id,
            platfromUserId: res.platfromAccountId!,
            provider: "Github"
        }
    }


    async findUnique(id: string, provider: provider) {

        const res = await this.prisma.PlatfromIntegration.findUnique({
            where: {
                  userId_platform: {
                    userId: id,
                    provider: provider
                }
            }
        })

        if (!res?.accessToken || !res?.refreshToken) throw new BadRequestException("ERRORR HAHAHA KASIAN BANGET")


        return {
            accessToken: res?.accessToken,
            refreshToken: res?.refreshToken
        }

    }

  async getUserId(clerkId: string): Promise<string> {
        const response = await this.prisma.user.findUnique({
            where: {
                clerkId: clerkId
            }
        })
        if (!response?.id)throw new BadRequestException("notfound")

   
        return response?.id
    }






}