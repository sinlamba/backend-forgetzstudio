import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { githubRepoPort, REPO_PORT } from './port/githubRepoPort';
import { SaveTokensParams } from '../common/types/tokenDataType';
import { CLIENT_PORT } from './port/githubClientPort';
import { githubClient } from './client/githubClient';
import { provider, saveTokens } from './types/repo/common';




@Injectable()
export class GithubService {

    constructor(

        //HEXAGONAL PATTERN
        @Inject(REPO_PORT)
        private readonly githubRepository: githubRepoPort,


        @Inject(CLIENT_PORT)
        private readonly githubClient: githubClient
    ) { }

    /**
* 
* @instance MENGGUNAKAN CLIENT PORT 

* @returns MENGEMBALIKAN GITHUB CLIENT
*/

    getSignUrl() {
        return this.githubClient.getUrlOauth()
    }

    async exchangeCodeForToken(code: string) {
        return this.githubClient.exchangeCodeForToken(code)
    }

    async getGithubUser(token: string) {
        return this.githubClient.getGithubUser(token)
    }







    /**
    * 
    * @instance MENGGUNAKAN REPO PORT 
    
    * @returns MENGEMBALIKAN GITHUB REPOSIROY
    */

    async saveTokens(props: saveTokens) {
        return this.githubRepository.saveToken(props)
    }
    async getTokenFromDb(userId: string, provider: provider) {
        return await this.githubRepository.findUnique(
            userId,
            provider
            
        )
    }

    async getUser(userId: string) {
        return this.githubRepository.getIdUser(userId)
    }




}
