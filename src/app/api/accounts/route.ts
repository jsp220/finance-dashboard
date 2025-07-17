import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AccountType } from "@/src/app/lib/enums/account-type";
import { withAuth } from "@/lib/jwt-middleware";

export const GET = withAuth(async (req: NextRequest, userId: string) => {
    try {
        // Get all accounts for the user
        const accounts = await prisma.account.findMany({
            where: {
                userId: userId,
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
            orderBy: {
                createdAt: "asc", // Show oldest accounts first
            },
        });

        return NextResponse.json({ accounts }, { status: 200 });
    } catch (error) {
        console.error("Error fetching accounts:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
});

export const POST = withAuth(async (req: NextRequest, userId: string) => {
    try {
        // Parse request body
        const body = await req.json();
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

        // Validate balance is a number
        if (typeof balance !== "number") {
            return NextResponse.json(
                { error: "Balance must be a number" },
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

        return NextResponse.json({ account }, { status: 201 });
    } catch (error) {
        console.error("Error creating account:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
});
