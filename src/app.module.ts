import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { getConnectionToken, MongooseModule } from "@nestjs/mongoose";
import { GitWebhooksController } from "./git-webhooks/git-webhooks.controller";
import { Commit, CommitSchema } from "./commits/commit.schema";
import { CommitsService } from "./commits/commits.service";
import { OpenaiService } from "./openai/openai.service";
import { Connection } from "mongoose";
import { Repository, RepositorySchema } from "./repositories/repository.schema";
import { User, UserSchema } from "./users/user.schema";
import { AuthModule } from "./auth/auth.module";

console.log(process.env.MONGO_URI);

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(process.env.MONGO_URI ?? "", {
            connectionFactory: (connection) => {
                connection.once("open", () => console.log("MongoDB connected!"));
                return connection;
            }
        }),
        MongooseModule.forFeatureAsync([
            {
                name: Commit.name,
                useFactory: async (connection: Connection) => {
                    const schema = CommitSchema;
                    const AutoIncrement = require("mongoose-sequence")(connection);
                    schema.plugin(AutoIncrement, { inc_field: "commit_id" });
                    return schema;
                },
                inject: [getConnectionToken()]
            },
            {
                name: Repository.name,
                useFactory: async (connection: Connection) => {
                    const schema = RepositorySchema;
                    const AutoIncrement = require("mongoose-sequence")(connection);
                    schema.plugin(AutoIncrement, { inc_field: "repo_id" });
                    return schema;
                },
                inject: [getConnectionToken()]
            },
            {
                name: User.name,
                useFactory: async (connection: Connection) => {
                    const schema = UserSchema;
                    const AutoIncrement = require("mongoose-sequence")(connection);
                    schema.plugin(AutoIncrement, { inc_field: "user_id" });
                    return schema;
                },
                inject: [getConnectionToken()]
            }
        ]),
        AuthModule
    ],
    controllers: [AppController, GitWebhooksController],
    providers: [AppService, CommitsService, OpenaiService]
})
export class AppModule {}
