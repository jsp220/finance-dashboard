import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { JWTPayload } from "@/src/app/lib/types/auth";

export function getAuthenticatedUserId(request: NextRequest): string | null {
    try {
        const authHeader = request.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        const token = authHeader.substring(7); // Remove "Bearer "

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not set");
            return null;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
        return decoded.id;
    } catch (error) {
        console.error("JWT verification failed:", error);
        return null;
    }
}

export function withAuth(
    handler: (req: NextRequest, userId: string) => Promise<NextResponse>
) {
    return async (req: NextRequest) => {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        return handler(req, userId);
    };
}
