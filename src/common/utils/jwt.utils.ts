import {
    sign,
    verify,
    JsonWebTokenError,
    TokenExpiredError,
    Secret,
    SignOptions
} from "jsonwebtoken";
import { Result, ok, err } from "neverthrow";
import { AppError } from "../errors/app.error";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface TokenPayload {
    userId: number;
    email: string;
}

export interface Tokens {
    accessToken: string;
    refresh_token: string;
}

@Injectable()
export class JwtUtils {
    constructor(private configService: ConfigService) {}

    private get accessSecret(): string {
        return this.configService.get<string>("JWT_ACCESS_SECRET") || "access-secret";
    }

    private get refreshSecret(): string {
        return this.configService.get<string>("JWT_REFRESH_SECRET") || "refresh-secret";
    }

    private get accessExpiry(): string {
        return this.configService.get<string>("JWT_ACCESS_EXPIRY") || "15m";
    }

    private get refreshExpiry(): string {
        return this.configService.get<string>("JWT_REFRESH_EXPIRY") || "7d";
    }

    /**
     * Generate both access and refresh tokens
     */
    generateTokens(payload: TokenPayload): Tokens {
        const accessToken = sign(
            payload,
            this.accessSecret as Secret,
            {
                expiresIn: this.accessExpiry
            } as SignOptions
        );

        const refresh_token = sign(
            payload,
            this.refreshSecret as Secret,
            {
                expiresIn: this.refreshExpiry
            } as SignOptions
        );

        return { accessToken, refresh_token };
    }

    /**
     * Verify an access token
     */
    verifyAccessToken(token: string): Result<TokenPayload, AppError> {
        try {
            const payload = verify(token, this.accessSecret) as TokenPayload;
            return ok(payload);
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                return err(
                    new AppError("Access token has expired", 401, "ACCESS_TOKEN_EXPIRED", error)
                );
            }
            if (error instanceof JsonWebTokenError) {
                return err(
                    new AppError("Invalid access token", 401, "INVALID_ACCESS_TOKEN", error)
                );
            }
            return err(
                new AppError("Token verification failed", 401, "TOKEN_VERIFICATION_FAILED", error)
            );
        }
    }

    /**
     * Verify a refresh token
     */
    verifyRefreshToken(token: string): Result<TokenPayload, AppError> {
        try {
            const payload = verify(token, this.refreshSecret) as TokenPayload;
            return ok(payload);
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                return err(
                    new AppError("Refresh token has expired", 401, "REFRESH_TOKEN_EXPIRED", error)
                );
            }
            if (error instanceof JsonWebTokenError) {
                return err(
                    new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN", error)
                );
            }
            return err(
                new AppError("Token verification failed", 401, "TOKEN_VERIFICATION_FAILED", error)
            );
        }
    }

    /**
     * Generate a new access token from a refresh token
     */
    refreshAccessToken(refresh_token: string): Result<string, AppError> {
        const verificationResult = this.verifyRefreshToken(refresh_token);

        if (verificationResult.isErr()) {
            return err(verificationResult.error);
        }

        const payload = verificationResult.value;
        const newAccessToken = sign(
            payload,
            this.accessSecret as Secret,
            {
                expiresIn: this.accessExpiry
            } as SignOptions
        );

        return ok(newAccessToken);
    }
}
