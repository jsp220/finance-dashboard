import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/jwt-middleware";
import { TransactionType } from "@/src/app/lib/enums/transaction-type";

export const GET = withAuth(async (request: NextRequest, userId: string) => {
    try {
        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const offset = parseInt(searchParams.get("offset") || "0");
        const limit = Math.min(
            parseInt(searchParams.get("limit") || "20"),
            100
        ); // Max 100
        const accountId = searchParams.get("accountId");
        const category = searchParams.get("category");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const type = searchParams.get("type");

        // Build where clause
        const where = {
            userId: userId,
            ...(accountId && { accountId }),
            ...(category && { category }),
            ...(type && { type: type as TransactionType }),
            ...((startDate || endDate) && {
                date: {
                    ...(startDate && { gte: startDate }),
                    ...(endDate && { lte: endDate }),
                },
            }),
        };

        // Get total count for pagination
        const total = await prisma.transaction.count({ where });

        // Get transactions
        const transactions = await prisma.transaction.findMany({
            where,
            select: {
                id: true,
                accountId: true,
                amount: true,
                type: true,
                category: true,
                description: true,
                date: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: [
                { date: "desc" }, // Most recent transactions first
                { createdAt: "desc" }, // Then by creation time
            ],
            skip: offset,
            take: limit,
        });

        // Calculate pagination info
        const hasNext = offset + limit < total;

        return NextResponse.json({
            transactions,
            pagination: {
                offset,
                limit,
                total,
                hasNext,
            },
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
});

export const POST = withAuth(async (request: NextRequest, userId: string) => {
    try {
        // Parse request body
        const body = await request.json();
        const { accountId, amount, type, category, description, date } = body;

        // Basic validation
        if (!accountId || amount === undefined || !type || !category || !date) {
            return NextResponse.json(
                {
                    error: "accountId, amount, type, category, and date are required",
                },
                { status: 400 }
            );
        }

        // Validate amount is a number
        if (typeof amount !== "number") {
            return NextResponse.json(
                { error: "Amount must be a number" },
                { status: 400 }
            );
        }

        // Validate transaction type
        if (!Object.values(TransactionType).includes(type)) {
            return NextResponse.json(
                {
                    error: "Invalid transaction type. Must be: income, expense, transfer, or refund",
                },
                { status: 400 }
            );
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return NextResponse.json(
                { error: "Date must be in YYYY-MM-DD format" },
                { status: 400 }
            );
        }

        // Use database transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // Check if account exists and belongs to user
            const account = await tx.account.findFirst({
                where: {
                    id: accountId,
                    userId: userId,
                },
            });

            if (!account) {
                throw new Error("Account not found or access denied");
            }

            const newBalance = parseFloat(account.balance.toString()) + amount;

            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    accountId,
                    amount,
                    type,
                    category,
                    description: description || null,
                    date,
                },
                select: {
                    id: true,
                    accountId: true,
                    amount: true,
                    type: true,
                    category: true,
                    description: true,
                    date: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            const updatedAccount = await tx.account.update({
                where: { id: accountId },
                data: {
                    balance: newBalance,
                },
            });

            return { transaction, updatedAccount };
        });

        return NextResponse.json(result.transaction, { status: 201 });
    } catch (error) {
        console.error("Error creating transaction:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
});
