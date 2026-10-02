import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service";
import { SaveTokensParams } from "../types/tokenDataType";

@Injectable()
export class PrismaHelper {

  constructor(private Prisma: DatabaseService) { }


  async FindUnique(userId: string, provider: string) {
    return await this.Prisma.PlatformIntegrations.findUnique({
      where: {
          userId_platform: {
          userId: userId,
          platform: provider

        }
      }
    })
  }


   
    


}