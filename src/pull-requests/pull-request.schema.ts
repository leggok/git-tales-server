import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * Pull Request document interface
 * Example:
 * {
 *   "pr_id": 123,
 *   "number": 42,
 *   "title": "Fix bug",
 *   "state": "merged",
 *   "merged_at": "2025-09-01T10:12:00Z",
 *   "author": "username",
 *   "base_branch": "main",
 *   "head_branch": "feature/fix-bug",
 *   "created_at": "2025-08-25T12:00:00Z",
 *   "updated_at": "2025-09-01T10:12:00Z"
 * }
 */
@Schema({ collection: "pull_requests" })
export class PullRequest extends Document {
    @Prop({ unique: true })
    pr_id: number;

    @Prop()
    number: number;

    @Prop()
    repo_id: number;

    @Prop()
    title: string;

    @Prop()
    state: string;

    @Prop()
    merged_at: Date;

    @Prop()
    author: string;

    @Prop()
    commits_link: string;

    @Prop()
    base_branch: string;

    @Prop()
    head_branch: string;

    @Prop()
    created_at: Date;

    @Prop()
    updated_at: Date;
}

export const PullRequestSchema = SchemaFactory.createForClass(PullRequest);
