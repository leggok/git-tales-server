import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MongooseModule } from "@nestjs/mongoose";
import { GitWebhooksController } from "./git-webhooks/git-webhooks.controller";
import { Commit, CommitSchema } from "./commits/commit.schema";
import { CommitsService } from "./commits/commits.service";

@Module({
    imports: [
        MongooseModule.forRoot(process.env.MONGO_URI ?? "mongodb://localhost/git-tales"),
        MongooseModule.forFeature([{ name: Commit.name, schema: CommitSchema }])
    ],
    controllers: [AppController, GitWebhooksController],
    providers: [AppService, CommitsService]
})
export class AppModule {}
