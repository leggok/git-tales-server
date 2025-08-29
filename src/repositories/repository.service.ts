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
            console.log("git_repo_id", git_repo_id);
            console.log("repo git_repo_id", repo);

            return ok(repo);
        } catch (error) {
            return err(
                new AppError("Failed to get repository", 500, "REPOSITORY_GET_FAILED", error)
            );
        }
    }

    async createRepository(repo: Repository) {
        try {
            console.log(" create repo", repo);
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
}
