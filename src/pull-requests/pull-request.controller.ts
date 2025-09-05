import { Controller, Get, Param } from "@nestjs/common";
import { PullRequestService } from "./pull-request.service";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Commit } from "../commits/commit.schema";
import { PullRequest } from "./pull-request.schema";

@Controller("pull-requests")
export class PullRequestController {
    constructor(
        private prService: PullRequestService,
        @InjectModel(PullRequest.name) private prModel: Model<PullRequest>,
        @InjectModel(Commit.name) private commitModel: Model<Commit>
    ) {}

    /**
     * GET /pull-requests/:id/with-commits
     * Returns a pull request document along with its commits
     */
    @Get(":id/with-commits")
    async getPullRequestWithCommits(@Param("id") id: number) {
        const pr = await this.prModel.findOne({ pr_id: id });
        if (!pr) {
            return { message: "Pull request not found" };
        }

        const commits = await this.commitModel.find({ pr_id: id });

        return {
            pullRequest: pr,
            commits
        };
    }
    /**
     * GET /pull-requests/:owner/:repo
     */
    @Get(":owner/:repo")
    async getPullRequests(@Param("owner") owner: string, @Param("repo") repo: string) {
        const result = await this.prService.fetchAndSave(owner, repo);

        if (result.isErr()) {
            throw result.error;
        }

        return {
            message: "Pull requests fetched & saved successfully",
            pullRequests: result.value
        };
    }
}
