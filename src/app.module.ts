import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { getConnectionToken, MongooseModule } from "@nestjs/mongoose";
import { GitWebhooksController } from "./git-webhooks/git-webhooks.controller";
import { Commit, CommitSchema } from "./commits/commit.schema";
import { CommitsService } from "./commits/commits.service";
import { OpenaiService } from "./openai/openai.service";
import { Connection } from "mongoose";

console.log(process.env.MONGO_URI);

@Module({
    imports: [
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
            }
        ])
    ],
    controllers: [AppController, GitWebhooksController],
    providers: [AppService, CommitsService, OpenaiService]
})
export class AppModule {}
