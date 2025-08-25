import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, DeleteResult } from "mongoose";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./user.schema";
import { Result, ok, err } from "neverthrow";
import { AppError } from "../common/errors/app.error";

const allowedFieldsForCreate: (keyof User)[] = ["name", "email", "password"];
const allowedFieldsForUpdate: (keyof User)[] = ["name", "email", "avatar", "bio", "webhook_secret"];

function assignAllowedFields<T>(target: T, source: Partial<T>, fields: (keyof T)[]): void {
    for (const key of fields) {
        const value = source[key];
        if (value !== undefined) {
            target[key] = value!;
        }
    }
}

@Injectable()
export class UserService {
    /**
     * Here, we have used data mapper approch for this tutorial that is why we
     * injecting repository here. Another approch can be Active records.
     */
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>
    ) {}

    /**
     * this is function is used to create User in User Entity.
     * @param createUserDto this will type of createUserDto in which
     * we have defined what are the keys we are expecting from body
     * @returns promise of user
     */
    async createUser(createUserDto: CreateUserDto): Promise<Result<User, AppError>> {
        try {
            const existingUser = await this.userModel.findOne({
                email: createUserDto.email
            });

            if (existingUser) {
                return err(new AppError("Email is already taken", 409));
            }

            const userData: Partial<User> = {};

            assignAllowedFields(userData, createUserDto, allowedFieldsForCreate);

            const savedUser = await this.userModel.create(userData);
            return ok(savedUser);
        } catch (error) {
            return err(new AppError("Failed to create user", 500, "USER_CREATION_FAILED", error));
        }
    }

    /**
     * Get user by id or email. If both are provided, id takes priority.
     * @param filter Object containing either id or email or both
     * @returns Promise of user
     */
    async getUser({ id, email }: { id?: number; email?: string }): Promise<Result<User, AppError>> {
        try {
            if (!id && !email) {
                return err(
                    new AppError(
                        "Either id or email must be provided",
                        400,
                        "INVALID_USER_CREDENTIALS"
                    )
                );
            }

            const filter: any = {};

            if (id !== undefined) {
                filter.user_id = id;
            }
            if (email) {
                filter.email = email;
            }

            const user = await this.userModel.findOne(filter);

            if (!user) {
                return err(new AppError("User not found", 404));
            }

            return ok(user);
        } catch (error) {
            return err(new AppError("Failed to get user", 500, "USER_GET_FAILED", error));
        }
    }

    /**
     * this function is used to updated specific user whose id is passed in
     * parameter along with passed updated data
     * @param id is type of number, which represent the id of user.
     * @param updateUserDto this is partial type of createUserDto.
     * @returns promise of udpate user
     */
    async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<Result<User, AppError>> {
        try {
            const user = await this.userModel.findOne({ user_id: id });

            if (!user) {
                return err(new AppError("User not found", 404));
            }

            assignAllowedFields(user, updateUserDto, allowedFieldsForUpdate);

            const updatedUser = await this.userModel.findOneAndUpdate({ user_id: id }, user, {
                new: true
            });

            if (!updatedUser) {
                return err(new AppError("Failed to update user", 500));
            }

            return ok(updatedUser);
        } catch (error) {
            return err(new AppError("Failed to update user", 500, "USER_UPDATE_FAILED", error));
        }
    }

    /**
     * this function is used to delete user from database.
     * @param id is the type of number, which represent id of user
     * @returns nuber of rows deleted or affected
     */
    async removeUser(id: number): Promise<Result<DeleteResult, AppError>> {
        try {
            const result = await this.userModel.deleteOne({ user_id: id });
            return ok(result);
        } catch (error) {
            return err(new AppError("Failed to remove user", 500, "USER_REMOVAL_FAILED", error));
        }
    }
}
