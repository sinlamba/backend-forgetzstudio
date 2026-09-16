import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service";
import { SaveTokensParams } from "../types/tokenDataType";

@Injectable()
export class PrismaHelper {

  constructor(private Prisma: DatabaseService) { }

  async saveTokens({ userId, accessToken, refreshToken, providersParams }: SaveTokensParams) {

    await this.Prisma.integration.create({
      data: {
        userId: userId,
        provider: providersParams || "",
        accessToken: accessToken,
        refreshToken: refreshToken || ""
      }
    })

  }

  async FindUnique(userId: string, provider: string) {
    return await this.Prisma.integration.findUnique({
      where: {
        userId_provider: {
          userId: userId,
          provider: provider

        }
      }
    })
  }


   
    


}