import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Commit } from "./commit.schema";

interface WebhookPayload {
    repository: any;
    sender: any;
    compare: string;
    commits: any[];
}

@Injectable()
export class CommitsService {
    constructor(@InjectModel(Commit.name) private commitModel: Model<Commit>) {}

    async createFromWebhook(payload: WebhookPayload): Promise<void> {
        const repo = payload.repository;
        const sender = payload.sender;
        const compare = payload.compare;

        const docs = payload.commits.map((c) => ({
            repo_name: repo.name,
            repo_link: repo.html_url,
            repo_description: repo.description,
            repo_language: repo.language,
            commit_message: c.message,
            commit_tree_id: c.tree_id,
            commit_url: c.url,
            commit_timestamp: new Date(c.timestamp),
            repo_owner_name: repo.owner?.name ?? repo.owner?.login,
            repo_owner_link: repo.owner?.html_url,
            commit_sender_name: sender.login,
            commit_sender_avatar: sender.avatar_url,
            compare,
            commit_added_files: c.added ?? [],
            commit_removed_files: c.removed ?? [],
            commit_modified_files: c.modified ?? []
        }));

        await this.commitModel.insertMany(docs);
    }
}
