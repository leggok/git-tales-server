import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RefreshTokenDto {
    @ApiProperty({
        description: "The refresh token to use for getting a new access token"
    })
    @IsString()
    @IsNotEmpty()
    refresh_token: string;
}
