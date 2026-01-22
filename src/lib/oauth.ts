import axios from "axios";
import {ENV} from "@/config/env.ts";

export const oauthApi = axios.create({
    baseURL: ENV.AUTH_URL,
    headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    }
});
