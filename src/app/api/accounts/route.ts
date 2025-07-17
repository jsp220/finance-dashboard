import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AccountType } from "@/src/app/lib/enums/account-type";

function getClientUserId(request: NextRequest): string | null {
    // For now, get user ID from header (before JWT implementation)
    return request.headers.get("x-user-id") || null;
}

export async function GET(request: NextRequest) {
    try {
        const userId = getClientUserId(request);

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        // Get all accounts for the user
        const accounts = await prisma.account.findMany({
            where: {
                userId: userId,
            },
            select: {
                id: true,
                name: true,
                userId: true,
                type: true,
                balance: true,
                currency: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: "asc", // Show oldest accounts first
            },
        });

        return NextResponse.json({ accounts });
    } catch (error) {
        console.error("Error fetching accounts:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const userId = getClientUserId(request);

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { name, type, balance = 0, currency = "USD" } = body;

        // Basic validation
        if (!name || !type) {
            return NextResponse.json(
                { error: "Name and type are required" },
                { status: 400 }
            );
        }

        // Validate account type
        if (!Object.values(AccountType).includes(type)) {
            return NextResponse.json(
                {
                    error: "Invalid account type. Must be: checking, savings, credit, or investment",
                },
                { status: 400 }
            );
        }

        // Check if user exists
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userExists) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Create the account
        const account = await prisma.account.create({
            data: {
                userId,
                name,
                type,
                balance,
                currency,
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                type: true,
                balance: true,
                currency: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(account, { status: 201 });
    } catch (error) {
        console.error("Error creating account:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
