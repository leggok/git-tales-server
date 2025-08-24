import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ collection: "commits" })
export class Commit extends Document {
    @Prop({ unique: true })
    commit_id: number;

    @Prop()
    repo_name: string;

    @Prop()
    repo_link: string;

    @Prop()
    repo_description: string;

    @Prop()
    repo_language: string;

    @Prop()
    commit_message: string;

    @Prop()
    git_commit_tree_id: string;

    @Prop()
    git_commit_id: string;

    @Prop()
    commit_url: string;

    @Prop()
    commit_timestamp: Date;

    @Prop()
    repo_owner_name: string;

    @Prop()
    repo_owner_link: string;

    @Prop()
    commit_sender_name: string;

    @Prop()
    commit_sender_avatar: string;

    @Prop()
    compare: string;

    @Prop({ type: [String] })
    commit_added_files: string[];

    @Prop({ type: [String] })
    commit_removed_files: string[];

    @Prop({ type: [String] })
    commit_modified_files: string[];

    @Prop({ default: null })
    commit_haiku: string;
}

export const CommitSchema = SchemaFactory.createForClass(Commit);
