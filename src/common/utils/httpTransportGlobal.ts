import { Injectable } from "@nestjs/common"
import axios, { AxiosResponse } from "axios"
type HttpMethod = "GET" | "POST";

interface MakeRequestConfig {
    url: string;
    method: HttpMethod;
    query?: URLSearchParams;
    body?: URLSearchParams;
    headers?: Record<string, string>;
}

@Injectable()
export class HttpTransportGlobal {


    async makeRequestFetch<T>({
        url,
        method,
        query,
        body,
        headers,
    }: MakeRequestConfig): Promise<T> {
        const urlWithQuery =
            query
                ? `${url}?${query.toString()}`
                : url;

        const response = await fetch(urlWithQuery, {
            method,
            headers,
            body: method === "POST" ? body : undefined,
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        return response.json() as Promise<T>;
    }

    async makeRequestAxios<T>({
        url,
        method,
        params,
        access_token,
        headers
    }: {
         headers: Record<string, string>
        url: string
        method: "GET" | "POST"
        params: Record<string, string> | URLSearchParams
        access_token?: string
    }): Promise<T> {
        const config = {
            method,
            url,
            ...(method === "GET"
                ? { params }
                : { data: params }),
            headers: {
                ...headers,
                Authorization: `Bearer ${access_token}`,
            },
        }

        const response: AxiosResponse<T> = await axios(config)
        return response.data
    }

}