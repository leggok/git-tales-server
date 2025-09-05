import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ collection: "commits" })
export class Commit extends Document {
    /** Unique SHA of the commit */
    @Prop({ unique: true })
    commit_id: string;

    @Prop()
    repo_id: number;

    /**
     * Associated pull request id (link to PullRequest.pr_id)
     */
    @Prop()
    pr_id: number;

    @Prop()
    commit_message: string;

    /** Author login/username */
    @Prop()
    author: string;

    @Prop({ default: null })
    branch: string;

    @Prop()
    git_commit_tree_id: string;

    @Prop()
    git_commit_id: string;

    @Prop()
    commit_url: string;

    /** ISO date of commit (committed_at) */
    @Prop()
    committed_at: Date;

    // Keeping existing optional metadata for backwards compatibility
    @Prop()
    user_id: number;

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
