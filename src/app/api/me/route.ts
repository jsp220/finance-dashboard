import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/jwt-middleware";

export const GET = withAuth(async (req: NextRequest, userId: string) => {
    try {
        // Get all accounts for the user
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                email: true,
                name: true,
                currency: true,
                timezone: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
});
