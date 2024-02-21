import { app, credential } from "firebase-admin";
import { initializeApp, App } from "firebase-admin/app";
import AuthConfig from "./configs/auth.config";
import {getAuth, Auth, UserRecord} from "firebase-admin/auth";
import { CustomException } from "./common/exceptions";
import { AuthExceptions } from "./common/values";
import { StatusCodes } from "./common/values";
import { Injectable } from "@nestjs/common";

@Injectable()
export default class AuthService {
    private static _app: App;

    static init(): void {
        this._app = initializeApp({
            credential: credential.cert(AuthConfig)
        });
    };

    static async verifyToken(token: string): Promise<{
        aud: string,
        auth_time: number,
        email_verified?: boolean,
        email?: string,
        exp: number,
        firebase: {
            identities: {
                [key: string]: any;
            };
            sign_in_provider: string;
            sign_in_second_factor?: string;
            second_factor_identifier?: string;
            tenant?: string;
            [key: string]: any;
        },
        iat: number,
        iss: string,
        phone_number?: string,
        picture?: string,
        sub: string,
        uid: string
    }> {
        try{
            let auth = getAuth(this._app);
            let decoded = await auth.verifyIdToken(token);
            return decoded;
        }
        catch(e){
            throw new CustomException(AuthExceptions.NOT_AUTHENTIFIED, StatusCodes.ACCESS_DENIED, "You're not authentified");
        }
    }
};