import { Controller, Post, UnauthorizedException, Req, Headers } from "@nestjs/common";
import * as crypto from "crypto";
import { CommitsService } from "../commits/commits.service";
import { OpenaiService } from "../openai/openai.service";
import { Commit } from "../commits/commit.schema";

@Controller("events/git-webhooks")
export class GitWebhooksController {
    constructor(
        private commitsService: CommitsService,
        private openaiService: OpenaiService
    ) {}

    @Post()
    async handleWebhook(@Req() req: Request, @Headers("x-hub-signature-256") signature: string) {
        const secret = process.env.GITHUB_WEBHOOK_SECRET;
        if (!secret) {
            throw new Error("GITHUB_WEBHOOK_SECRET is not set");
        }
        const body = JSON.stringify(req.body);

        const hmac = crypto.createHmac("sha256", secret);
        const digest = `sha256=${hmac.update(body).digest("hex")}`;

        if (signature !== digest) {
            throw new UnauthorizedException("Invalid signature");
        }

        // Зберігаємо коміти в Mongo
        const savedCommits = await this.commitsService.createFromWebhook(req.body as any);

        // Формуємо масив повідомлень комітів
        const commitMessages = savedCommits.map((c: any) => c.commit_message);

        // Отримуємо відповіді від OpenAI
        // const haikuResponses = await this.openaiService.haikuAboutAI(commitMessages);

        // Мапимо і додаємо haiku до відповідного коміта
        // for (let i = 0; i < savedCommits.length; i++) {
        //     await this.commitsService.updateCommitHaiku(
        //         savedCommits[i]._id as any,
        //         haikuResponses[i]
        //     );
        // }

        return {
            message: "Webhook received and processed successfully",
            savedCommits,
            commitMessages
            // haikuResponses
        };
    }
}
