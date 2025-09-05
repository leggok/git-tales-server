import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PullRequest, PullRequestSchema } from "./pull-request.schema";
import { Commit, CommitSchema } from "../commits/commit.schema";
import { PullRequestController } from "./pull-request.controller";
import { PullRequestService } from "./pull-request.service";
import { RepositoryService } from "../repositories/repository.service";
import { Repository, RepositorySchema } from "../repositories/repository.schema";
import { getConnectionToken, MongooseModule as NestMongooseModule } from "@nestjs/mongoose";
import { CommitsService } from "../commits/commits.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: PullRequest.name, schema: PullRequestSchema },
            { name: Repository.name, schema: RepositorySchema },
            { name: Commit.name, schema: CommitSchema }
        ])
    ],
    controllers: [PullRequestController],
    providers: [PullRequestService, RepositoryService, CommitsService]
})
export class PullRequestsModule {}
