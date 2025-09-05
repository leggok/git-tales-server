import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Repository } from "./repository.schema";
import { err, ok } from "neverthrow";
import { AppError } from "../common/errors/app.error";

interface WebhookPayload {
    repository: any;
    sender: any;
    compare: string;
    commits: any[];
}

@Injectable()
export class RepositoryService {
    constructor(@InjectModel(Repository.name) private repositoryModel: Model<Repository>) {}

    async getRepositories() {
        try {
            const repos = await this.repositoryModel.find();

            return ok(repos);
        } catch (error) {
            return err(
                new AppError("Failed to get repository", 500, "REPOSITORY_GET_FAILED", error)
            );
        }
    }

    async getRepository(git_repo_id: number) {
        try {
            const repo = await this.repositoryModel.findOne({ git_repo_id });

            return ok(repo);
        } catch (error) {
            return err(
                new AppError("Failed to get repository", 500, "REPOSITORY_GET_FAILED", error)
            );
        }
    }

    async getRepositoryByName(repo_name: string) {
        try {
            const repo = await this.repositoryModel.findOne({ repo_name });

            return ok(repo);
        } catch (error) {
            return err(
                new AppError(
                    "Failed to get repository by name",
                    500,
                    "REPOSITORY_GET_BY_NAME_FAILED",
                    error
                )
            );
        }
    }

    async createRepository(repo: Partial<Repository>) {
        try {
            const newRepo = await this.repositoryModel.create(repo);
            return ok(newRepo);
        } catch (error) {
            return err(
                new AppError("Failed to create repository", 500, "REPOSITORY_CREATE_FAILED", error)
            );
        }
    }

    async updateRepository(git_repo_id: number, repo: Repository) {
        try {
            const updatedRepo = await this.repositoryModel.findOneAndUpdate({ git_repo_id }, repo, {
                new: true
            });
            return ok(updatedRepo);
        } catch (error) {
            return err(
                new AppError("Failed to update repository", 500, "REPOSITORY_UPDATE_FAILED", error)
            );
        }
    }

    /**
     * Fetch pull requests for a given GitHub repository
     * @param owner GitHub username or organization that owns the repository
     * @param repo Repository name
     */
    async getPullRequests(owner: string, repo: string) {
        try {
            // Lazily import to avoid forcing users to install if they don't need this feature
            const { Octokit } = await import("@octokit/core");

            const octokit = new Octokit({
                auth: process.env.GITHUB_TOKEN ?? ""
            });

            const response = await octokit.request("GET /repos/{owner}/{repo}/pulls", {
                owner,
                repo,
                state: "all",
                headers: {
                    "X-GitHub-Api-Version": "2022-11-28"
                }
            });

            return ok(response.data);
        } catch (error) {
            return err(
                new AppError("Failed to get pull requests", 500, "PULL_REQUESTS_GET_FAILED", error)
            );
        }
    }
}
