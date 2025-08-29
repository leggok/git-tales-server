import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Commit } from "./commit.schema";
import { ok } from "neverthrow";

interface WebhookPayload {
    repository: any;
    sender: any;
    compare: string;
    commits: any[];
}

@Injectable()
export class CommitsService {
    constructor(@InjectModel(Commit.name) private commitModel: Model<Commit>) {}

    async getCommitsFromRepository(repositoryId: number) {
        const commits = await this.commitModel.find({ repo_id: repositoryId });
        return ok(commits);
    }

    async getCommit(commitId: string) {
        const commit = await this.commitModel.findById(commitId);
        return ok(commit);
    }

    async createCommit(commit: Commit) {
        const newCommit = await this.commitModel.create(commit);
        return ok(newCommit);
    }

    async updateCommit(commitId: string, commit: Commit) {
        await this.commitModel.findByIdAndUpdate(commitId, commit);
        return ok(commit);
    }

    async deleteCommit(commitId: string) {
        await this.commitModel.findByIdAndDelete(commitId);
        return ok(commitId);
    }

    async deleteAllCommits() {
        await this.commitModel.deleteMany();
        return ok(true);
    }

    async createFromWebhook(payload: WebhookPayload) {
        const repo = payload.repository;
        const sender = payload.sender;
        const compare = payload.compare;
        console.log("payload.commits", payload.commits);
        // Формуємо документи
        // Створюємо коміти по одному
        const savedCommits: Commit[] = [];
        for (const c of payload.commits) {
            const doc = {
                repo_id: repo.repo_id,
                repo_name: repo.name,
                repo_link: repo.html_url,
                repo_description: repo.description,
                repo_language: repo.language,
                commit_message: c.message,
                git_commit_tree_id: c.tree_id,
                git_commit_id: c.id,
                commit_url: c.url,
                commit_timestamp: new Date(c.timestamp),
                repo_owner_name: repo.owner?.name ?? repo.owner?.login,
                repo_owner_link: repo.owner?.html_url,
                commit_sender_name: sender.login,
                commit_sender_avatar: sender.avatar_url,
                compare,
                commit_added_files: c.added ?? [],
                commit_removed_files: c.removed ?? [],
                commit_modified_files: c.modified ?? [],
                commit_haiku: null
            };

            const saved = await this.commitModel.create(doc);
            savedCommits.push(saved);
        }

        return savedCommits;
    }

    // Оновлення коміта
    async updateCommitHaiku(commitId: string, haiku: string) {
        await this.commitModel.findByIdAndUpdate(commitId, { commit_haiku: haiku });
    }
}
