import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtUtils, TokenPayload } from "../utils/jwt.utils";
import { AppError } from "../errors/app.error";

type RequestWithUser = {
    headers: {
        authorization?: string;
    };
    user: TokenPayload;
};

export const Roles = (...roles: string[]) => {
    return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
        Reflect.defineMetadata("roles", roles, descriptor?.value ?? target);
    };
};

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private jwtUtils: JwtUtils
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<string[]>("roles", context.getHandler());

        if (!roles) {
            return true; // No roles specified means the endpoint is public
        }

        const request = context.switchToHttp().getRequest<RequestWithUser>();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new AppError("No authorization token provided", 401);
        }

        const [bearer, token] = authHeader.split(" ");

        if (bearer !== "Bearer" || !token) {
            throw new AppError("Invalid authorization header format", 401);
        }

        const verificationResult = this.jwtUtils.verifyAccessToken(token);

        if (verificationResult.isErr()) {
            throw verificationResult.error;
        }

        const payload = verificationResult.value;
        request.user = payload;

        return roles.includes(payload.email);
    }
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtUtils: JwtUtils) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<RequestWithUser>();
        const authHeader = request.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) return false;

        const token = authHeader.split(" ")[1];

        const verificationResult = this.jwtUtils.verifyAccessToken(token);

        if (verificationResult.isErr()) {
            return false;
        }

        request.user = verificationResult.value;
        return true;
    }
}
