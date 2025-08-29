import { Controller, Post, UnauthorizedException, Req, Headers, Get } from "@nestjs/common";
import * as crypto from "crypto";
import { CommitsService } from "../commits/commits.service";
import { OpenaiService } from "../openai/openai.service";
import { Commit } from "../commits/commit.schema";
import { AppError } from "../common/errors/app.error";
import { RepositoryService } from "./repository.service";

@Controller("repos")
export class RepositoryController {
    constructor(private repositoryService: RepositoryService) {}

    @Get()
    async getRepositories() {
        const result = await this.repositoryService.getRepositories();

        // Перевірка на помилку
        if (result instanceof AppError) {
            throw result;
        }

        return {
            message: "Repositories fetched successfully",
            repositories: result
        };
    }
}
