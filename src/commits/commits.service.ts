import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Commit } from "./commit.schema";
import { Result, err, ok } from "neverthrow";
import { RepositoryService } from "src/repositories/repository.service";
import { PullRequest } from "../pull-requests/pull-request.schema";
import { AppError } from "../common/errors/app.error";

interface WebhookPayload {
    repository: any;
    sender: any;
    compare: string;
    commits: any[];
    ref: string;
}

@Injectable()
export class CommitsService {
    constructor(
        @InjectModel(Commit.name) private commitModel: Model<Commit>,
        private repositoryService: RepositoryService
    ) {}

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

    /**
     * Fetch commits for a given Pull Request (by pr.commits_url) and persist them.
     * @param owner GitHub repository owner (user or organization)
     * @param repo Repository name
     * @param pr PullRequest document
     */
    async fetchAndSavePrCommits(
        owner: string,
        repo: string,
        pr: PullRequest
    ): Promise<Result<Commit[], AppError>> {
        try {
            const { Octokit } = await import("@octokit/core");
            const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN ?? "" });

            // GitHub REST: GET /repos/{owner}/{repo}/pulls/{pull_number}/commits
            const response = await octokit.request(
                "GET /repos/{owner}/{repo}/pulls/{pull_number}/commits",
                {
                    owner,
                    repo,
                    pull_number: pr.number,
                    headers: {
                        "X-GitHub-Api-Version": "2022-11-28"
                    }
                }
            );

            const commitsData = response.data as any[];
            const saved: Commit[] = [];

            for (const c of commitsData) {
                const doc = await this.commitModel.findOneAndUpdate(
                    { commit_id: c.sha },
                    {
                        commit_id: c.sha,
                        repo_id: pr.repo_id,
                        pr_id: pr.pr_id,
                        branch: pr.head_branch ?? null,
                        commit_message: c.commit?.message,
                        git_commit_tree_id: c.commit?.tree?.sha,
                        git_commit_id: c.sha,
                        commit_url: c.html_url,
                        committed_at: c.commit?.author?.date
                            ? new Date(c.commit.author.date)
                            : undefined,
                        author: c.author?.login ?? c.commit?.author?.name
                    },
                    {
                        upsert: true,
                        new: true
                    }
                );
                saved.push(doc);
            }

            return ok(saved);
        } catch (error) {
            return err(
                new AppError(
                    `Failed to fetch commits for PR #${pr.number}`,
                    500,
                    "PR_COMMITS_FETCH_FAILED",
                    error
                )
            );
        }
    }

    async createFromWebhook(payload: WebhookPayload) {
        const repo = payload.repository;
        const ref = payload.ref;
        const branch = ref.split("/").pop();

        // Пошук репозиторію у БД
        const repoRes = await this.repositoryService.getRepository(repo.id);
        if (repoRes.isErr()) {
            return err(repoRes.error);
        }

        let repoDoc = repoRes.value;

        // Якщо не знайдено – створюємо
        if (!repoDoc) {
            const newRepoRes = await this.repositoryService.createRepository({
                git_repo_id: repo.id,
                repo_name: repo.name,
                repo_link: repo.html_url,
                repo_description: repo.description,
                repo_language: repo.language,
                repo_owner_id: repo.owner.id
            });
            if (newRepoRes.isErr()) {
                return err(newRepoRes.error);
            }

            repoDoc = newRepoRes.value;
        }

        const sender = payload.sender;
        const compare = payload.compare;
        // Формуємо документи
        // Створюємо коміти по одному
        const savedCommits: Commit[] = [];
        for (const c of payload.commits) {
            const doc = {
                branch,
                repo_id: repoDoc.repo_id,
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
