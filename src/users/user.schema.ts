import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ collection: "users" })
export class User extends Document {
    @Prop({ unique: true })
    user_id: number;

    @Prop()
    name: string;

    @Prop()
    email: string;

    @Prop()
    password: string;

    @Prop()
    avatar: string;

    @Prop()
    bio: string;

    @Prop()
    webhook_secret: string;

    @Prop()
    refresh_token: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
