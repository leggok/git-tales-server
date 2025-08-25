import { Injectable } from "@nestjs/common";
import { UserService } from "../users/user.service";
import { JwtUtils, TokenPayload, Tokens } from "../common/utils/jwt.utils";
import { PasswordUtils } from "../common/utils/password.utils";
import { Result, ok, err } from "neverthrow";
import { AppError } from "../common/errors/app.error";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { User } from "../users/user.schema";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtUtils: JwtUtils
    ) {}

    async register(createUserDto: CreateUserDto): Promise<Result<Tokens, AppError>> {
        try {
            console.log("createUserDto", createUserDto);
            // Hash the password
            const hashResult = await PasswordUtils.hashPassword(createUserDto.password);
            if (hashResult.isErr()) {
                return err(hashResult.error);
            }

            // Create user with hashed password
            const createResult = await this.userService.createUser({
                ...createUserDto,
                password: hashResult.value
            });

            if (createResult.isErr()) {
                return err(createResult.error);
            }

            const user = createResult.value;
            return this.generateTokens(user);
        } catch (error) {
            return err(new AppError("Failed to register user", 500, "REGISTRATION_FAILED", error));
        }
    }

    async login(email: string, password: string): Promise<Result<Tokens, AppError>> {
        const userResult = await this.userService.getUser({ email });

        if (userResult.isErr()) {
            return err(new AppError("Invalid credentials", 401));
        }

        const user = userResult.value;
        const isPasswordValid = await PasswordUtils.comparePassword(password, user.password);

        if (!isPasswordValid) {
            return err(new AppError("Invalid credentials", 401));
        }

        return this.generateTokens(user);
    }

    async refreshToken(refresh_token: string): Promise<Result<Tokens, AppError>> {
        const verificationResult = this.jwtUtils.verifyRefreshToken(refresh_token);

        if (verificationResult.isErr()) {
            return err(verificationResult.error);
        }

        const payload = verificationResult.value;
        const userResult = await this.userService.getUser({
            id: payload.userId
        });

        if (userResult.isErr()) {
            return err(new AppError("User not found", 404));
        }

        const user = userResult.value;

        if (user.refresh_token !== refresh_token) {
            return err(new AppError("Invalid refresh token", 401));
        }

        return this.generateTokens(user);
    }

    async logout(userId: number): Promise<Result<void, AppError>> {
        const updateResult = await this.userService.updateUser(userId, {
            refresh_token: ""
        });

        if (updateResult.isErr()) {
            return err(updateResult.error);
        }

        return ok(undefined);
    }

    async me(userId: number): Promise<Result<User, AppError>> {
        const userResult = await this.userService.getUser({ id: userId });

        if (userResult.isErr()) {
            return err(userResult.error);
        }

        return ok(userResult.value);
    }

    private async generateTokens(user: User): Promise<Result<Tokens, AppError>> {
        const payload: TokenPayload = {
            userId: user.user_id,
            email: user.email
        };

        const tokens = this.jwtUtils.generateTokens(payload);

        // Store refresh token in database
        const updateResult = await this.userService.updateUser(user.user_id, {
            refresh_token: tokens.refresh_token
        });

        if (updateResult.isErr()) {
            return err(updateResult.error);
        }

        return ok(tokens);
    }
}
