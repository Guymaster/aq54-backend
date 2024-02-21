import { config } from "dotenv";

config();
const ApiConfig = {
    port: process.env.API_PORT,
    node_env: process.env.NODE_ENV,
    api_version: process.env.API_VERSION
};

export default ApiConfig;