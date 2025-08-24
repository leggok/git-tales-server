import { Injectable } from "@nestjs/common";
import OpenAI from "openai";

@Injectable()
export class OpenaiService {
    private readonly openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            // заберіть ключ з env-змінної або залиште «apikey» для локальних тестів
            apiKey: process.env.OPENAI_API_KEY ?? "apikey"
        });
    }

    /**
     * Викликає модель GPT-4o-mini та повертає згенерований текст.
     * @param prompt текст-запит користувача
     */
    async createResponse(prompt: string): Promise<string> {
        const response = await this.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }]
            // за потреби можна передати й інші опції (temperature, max_tokens тощо)
        });

        return response.choices[0]?.message?.content ?? "";
    }

    /** Швидкий приклад використання: хайку про AI */
    async haikuAboutAI(commits_messages: string[]): Promise<string> {
        return this.createResponse(
            `write a haiku about ai, based on the following commits messages: ${commits_messages.join(
                ", "
            )}`
        );
    }
}
