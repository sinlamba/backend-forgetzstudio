import { Injectable } from '@nestjs/common';
import { Cron } from "@nestjs/schedule"
import { containerId, containerResultType, instagramContainerResultType, publishExecType } from '../types';
import { InstagramRepository } from '../repository/instagram.repo';
import {
    InstagramClient as MetaInstagramClient,
} from '@binary-black-holes/instagram-api';
import axios from 'axios';
import { Apikey } from '../../common/configEnv/configEnv.service';
import { InstagramPort } from '../port/instagram.port';
import { InstagramMediaResponse } from '../types/mediaType';





@Injectable()
export class InstagramClient implements InstagramPort {
    public base_url;



    constructor(private readonly instagramRepository: InstagramRepository,
        private readonly apikey: Apikey
    ) {

        this.base_url = this.apikey.getApikey("INSTAGRAM_BASE_URL")
    }

    async getProfile(accessToken: string) {
        const client = new MetaInstagramClient({
            loginType: 'instagram',
            accessToken,
            apiVersion: 'v25.0',
        });



        return client.users.getProfile({
            fields: [
                'user_id',
                'username',
                'account_type',
                'profile_picture_url',
                'follows_count',
                'followers_count',
                'media_count'


            ],
        });
    }

    async getMedia(accessToken: string) {
        const client = new MetaInstagramClient({
            loginType: "instagram",
            accessToken,
            apiVersion: "v25.0",
        });

        const response = await client.users.listMedia({
            fields: [
                "id",
                "caption",
                "media_type",
                "media_url",
                "thumbnail_url",
                "permalink",
                "timestamp",
                "like_count",
                "comments_count",
                "owner",
            ],
        });

        return response.data;
    }


    private getContainerUrl(instagramUserId: string) {
        return `${this.base_url}/${instagramUserId}/media`;
    }

    async checkToken(accessToken: string) {
        const url = this.apikey.getApikey("INSTAGRAM_BASE_URL")
        const response = await fetch(
            `${url}/me?access_token=${encodeURIComponent(accessToken)}`,
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data?.error?.message || 'Instagram access token invalid',
            );
        }

        return data;
    }

    async createContainerId({
        instagramUserId,
        videoUrl,
        caption,
        accessToken,
        audioName,
    }: containerId): Promise<containerResultType> {
        if (!instagramUserId) {
            throw new Error('Instagram user ID not found');
        }

        if (!accessToken) {
            throw new Error('Instagram access token not found');
        }

        const url = this.getContainerUrl(instagramUserId);

    

        const body = new URLSearchParams({
            media_type: 'REELS',
            video_url: videoUrl,
            caption,
            access_token: accessToken,
        });

        if (audioName) {
            body.set('audio_name', audioName);
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data?.error?.message || 'Instagram API error',
            );
        }

        return data;
    }


    async publishExec(
        {
            instagramUserId,
            containerId,
            accessToken,
        }: publishExecType
    ) {
        let res: string[] = []

        const url = this.apikey.getApikey("INSTAGRAM_BASE_URL")
        for (const acess_token of accessToken) {
            const response = await axios.post(
                `${url}/${instagramUserId}/media_publish`,
                {
                    creation_id: containerId,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${acess_token}`,
                    },
                },
            );

            res.push(response.data)
        }


        return res;
    }

    @Cron("* * * * * ")
    async instagramPublish() {


        const containerId = await this.instagramRepository.getInstagramContainerUnpublisheds()

        const datas = containerId.map(doc => doc.userId)

        const accessToken = await this.instagramRepository.findManyAccessTokenInstagram(datas)




        for (const post of containerId) {

            const postData = await this.publishExec({
                instagramUserId: post.instagramUserId,
                containerId: post.containerId,
                accessToken: accessToken
            })


            const update = await this.instagramRepository.updatePublish(post.id)




            return {
                success: Boolean(postData),
                update: update.id

            }







        }




    }


    async getInstagramContainer(userId: string) {
        const response =
            await this.instagramRepository.findManyContainerId(userId);

        const result: string[] = response.map((item) => item.containerId);

        return result;
    }


    async findInstagramContainer(userId: string): Promise<instagramContainerResultType> {

        return this.instagramRepository.findInstagramContainer(userId)


    }






}