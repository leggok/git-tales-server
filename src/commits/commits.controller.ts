import { Controller, Get, Param } from "@nestjs/common";
import * as crypto from "crypto";
import { CommitsService } from "../commits/commits.service";
import { OpenaiService } from "../openai/openai.service";
import { Commit } from "../commits/commit.schema";
import { AppError } from "../common/errors/app.error";

@Controller("repos")
export class CommitsController {
    constructor(private commitsService: CommitsService) {}

    @Get(":id/commits")
    async getCommitsFromRepository(@Param("id") id: string) {
        const repositoryId = Number(id);
        const result = await this.commitsService.getCommitsFromRepository(repositoryId);

        // Перевірка на помилку
        if (result instanceof AppError) {
            throw result;
        }

        return {
            message: "Commits fetched successfully",
            commits: result
        };
    }
}
