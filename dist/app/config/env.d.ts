interface EnvConfig {
    PORT: string;
    DB_URL: string;
    NODE_ENV: "development";
    JWT_ACCESS_SECRET: string;
    JWT_ACCESS_EXPIRES: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRES: string;
    BCRYPT_SALT_ROUND: string;
}
export declare const envVars: EnvConfig;
export {};
//# sourceMappingURL=env.d.ts.map