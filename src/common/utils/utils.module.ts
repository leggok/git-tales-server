import { Module } from "@nestjs/common";
import { JwtUtils } from "./jwt.utils";

@Module({
    providers: [JwtUtils],
    exports: [JwtUtils]
})
export class UtilsModule {}
