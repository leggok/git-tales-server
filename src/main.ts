import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import SmeeClient from "smee-client";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true // <<< головне для DTO
        })
    );

    app.enableCors({
        origin: "http://localhost:5173",
        credentials: true,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        allowedHeaders: "Content-Type,Authorization"
    });

    await app.listen(process.env.PORT ?? 3000);

    // Start forwarding GitHub webhook events from Smee to our local Nest endpoint
    const smee = new SmeeClient({
        source: "https://smee.io/gqZzqpLHdvuDMDE",
        target: "http://localhost:3000/events/git-webhooks",
        logger: console
    });

    const events = smee.start();

    // To stop forwarding events, uncomment the following line:
    // events.close();
}
bootstrap();
