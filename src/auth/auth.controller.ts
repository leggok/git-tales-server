import {
    Body,
    Controller,
    Post,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
    Get,
    Res
} from "@nestjs/common";
import type { Response } from "express";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { JwtAuthGuard, RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/guards/roles.guard";
import { TokenPayload } from "../common/utils/jwt.utils";

type RequestWithUser = {
    user: TokenPayload;
};

@Controller("auth")
export class AuthController {
    private readonly refreshTokenMaxAge: number;

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) {
        this.refreshTokenMaxAge =
            this.configService.get<number>("JWT_REFRESH_EXPIRY_MS") || 7 * 24 * 60 * 60 * 1000;
    }

    @Post("register")
    @HttpCode(HttpStatus.OK)
    async register(
        @Body() createUserDto: CreateUserDto,
        @Res({ passthrough: true }) response: Response
    ) {
        console.log("createUserDto", createUserDto);
        const result = await this.authService.register(createUserDto);

        if (result.isErr()) {
            throw result.error;
        }

        const { accessToken, refresh_token } = result.value;

        response.cookie("refresh_token", refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: this.refreshTokenMaxAge
        });

        return { accessToken };
    }

    @Post("login")
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
        const result = await this.authService.login(loginDto.email, loginDto.password);

        if (result.isErr()) {
            throw result.error;
        }

        const { accessToken, refresh_token } = result.value;

        response.cookie("refresh_token", refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: this.refreshTokenMaxAge
        });

        return { accessToken };
    }

    @Post("refresh")
    @HttpCode(HttpStatus.OK)
    async refreshToken(
        @Body() refreshTokenDto: RefreshTokenDto,
        @Res({ passthrough: true }) response: Response
    ) {
        const result = await this.authService.refreshToken(refreshTokenDto.refresh_token);

        if (result.isErr()) {
            throw result.error;
        }

        const { accessToken, refresh_token } = result.value;

        response.cookie("refresh_token", refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: this.refreshTokenMaxAge
        });

        return { accessToken };
    }

    @Post("logout")
    @UseGuards(RolesGuard)
    @Roles("user", "admin", "teacher", "student")
    @HttpCode(HttpStatus.OK)
    async logout(@Req() request: RequestWithUser) {
        const user_id = request.user.userId;
        const result = await this.authService.logout(user_id);

        if (result.isErr()) {
            throw result.error;
        }

        return { message: "Successfully logged out" };
    }

    @Get("me")
    @UseGuards(JwtAuthGuard)
    async me(@Req() request: RequestWithUser, @Res({ passthrough: true }) response: Response) {
        const result = await this.authService.me(request.user.userId);

        if (result.isErr()) {
            throw result.error;
        }

        const user = result.value;

        const { password: _, refresh_token, ...userWithoutSensitiveData } = user;

        response.cookie("refresh_token", refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: this.refreshTokenMaxAge
        });

        return { ...userWithoutSensitiveData };
    }
}
