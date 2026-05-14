import { AuthConfig } from "../../work-app-config";

export interface AuthSession {
    isAuthenticated: boolean,
    config: AuthConfig,
    user: any,
    accessToken: any
}