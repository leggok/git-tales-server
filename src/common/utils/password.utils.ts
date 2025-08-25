import * as bcrypt from "bcrypt";
import { Result, ok, err } from "neverthrow";
import { AppError } from "../errors/app.error";

const SALT_ROUNDS = 10;

export class PasswordUtils {
    /**
     * Hash a password with a salt
     * @param password Plain text password
     * @returns Hashed password
     */
    static async hashPassword(password: string): Promise<Result<string, AppError>> {
        try {
            const salt = await bcrypt.genSalt(SALT_ROUNDS);
            const hash = await bcrypt.hash(password, salt);
            return ok(hash);
        } catch (error) {
            return err(
                new AppError("Failed to hash password", 500, "PASSWORD_HASHING_FAILED", error)
            );
        }
    }

    /**
     * Compare a plain text password with a hashed password
     * @param password Plain text password
     * @param hashedPassword Hashed password to compare against
     * @returns boolean indicating if passwords match
     */
    static async comparePassword(
        password: string,
        hashedPassword: string
    ): Promise<Result<boolean, AppError>> {
        try {
            const isMatch = await bcrypt.compare(password, hashedPassword);
            return ok(isMatch);
        } catch (error) {
            return err(
                new AppError(
                    "Failed to compare passwords",
                    500,
                    "PASSWORD_COMPARISON_FAILED",
                    error
                )
            );
        }
    }
}
