import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PullRequest } from "./pull-request.schema";
import { RepositoryService } from "../repositories/repository.service";
import { err, ok, Result } from "neverthrow";
import { AppError } from "../common/errors/app.error";
import { CommitsService } from "../commits/commits.service";

@Injectable()
export class PullRequestService {
    constructor(
        @InjectModel(PullRequest.name) private prModel: Model<PullRequest>,
        private repositoryService: RepositoryService,
        private commitsService: CommitsService
    ) {}

    async fetchAndSave(owner: string, repo: string): Promise<Result<PullRequest[], AppError>> {
        const repoRes = await this.repositoryService.getRepositoryByName(repo);

        if (repoRes.isErr()) {
            return err(repoRes.error);
        }

        let repoDoc = repoRes.value;

        if (!repoDoc) {
            return err(new AppError("Repository not found", 404, "REPOSITORY_NOT_FOUND"));
        }

        const prsRes = await this.repositoryService.getPullRequests(owner, repo);

        if (prsRes.isErr()) {
            return err(prsRes.error);
        }

        console.log("prsRes", prsRes.value);

        const saved: PullRequest[] = [];
        for (const pr of prsRes.value) {
            const doc = await this.prModel.findOneAndUpdate(
                { pr_id: pr.id },
                {
                    pr_id: pr.id,
                    number: pr.number,
                    repo_id: repoDoc.repo_id,
                    title: pr.title,
                    state: pr.state,
                    merged_at: pr.merged_at,
                    author: pr.user?.login,
                    base_branch: pr.base?.ref,
                    commits_link: pr.commits_url,
                    head_branch: pr.head?.ref,
                    created_at: pr.created_at,
                    updated_at: pr.updated_at
                },
                { upsert: true, new: true }
            );
            saved.push(doc);

            const commitsRes = await this.commitsService.fetchAndSavePrCommits(owner, repo, doc);
            if (commitsRes.isErr()) {
                return err(commitsRes.error);
            }
            console.log("commitsRes", commitsRes.value);
        }

        return ok(saved);
    }
}
