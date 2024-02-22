import { config } from "dotenv";
import { ServiceAccount } from "firebase-admin";

config();
const AuthConfig = {
    type: process.env.FB_ACCOUNT_TYPE,
    projectId: process.env.FB_PROJECT_ID,
    privateKeyId: process.env.FB_PRIVATE_KEY_ID,
    privateKey: process.env.FB_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FB_CLIENT_EMAIL,
    client_id: process.env.FB_CLIENT_ID,
    auth_uri: process.env.FB_AUTH_URI,
    token_uri: process.env.FB_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FB_AUTH_PROVIDER_X509,
    client_x509_cert_url: process.env.FB_CLIENT_X509,
    universe_domain: process.env.FB_UNIVERSE_DOMAIN
} as ServiceAccount;

export default AuthConfig;