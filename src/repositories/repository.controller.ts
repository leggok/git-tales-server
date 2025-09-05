import { Controller, Get, Param } from "@nestjs/common";
import { RepositoryService } from "./repository.service";

@Controller("repos")
export class RepositoryController {
    constructor(private repositoryService: RepositoryService) {}

    @Get()
    async getRepositories() {
        const result = await this.repositoryService.getRepositories();

        if (result.isErr()) {
            throw result.error;
        }

        return {
            message: "Repositories fetched successfully",
            repositories: result.value
        };
    }

    // moved pull-requests endpoint to PullRequestController
}
