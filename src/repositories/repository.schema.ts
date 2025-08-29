import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ collection: "repositories" })
export class Repository extends Document {
    @Prop({ unique: true })
    repo_id: number;

    @Prop()
    git_repo_id: number;

    @Prop()
    repo_name: string;

    @Prop()
    repo_link: string;

    @Prop()
    repo_description: string;

    @Prop()
    repo_language: string;

    @Prop()
    repo_owner_id: number;
}

export const RepositorySchema = SchemaFactory.createForClass(Repository);
