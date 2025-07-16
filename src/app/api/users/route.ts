import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
    try {
        //Parse the request body
        const body = await request.json();

        // Extract fields
        const {
            email,
            password,
            name,
            currency = "USD",
            timezone = "America/Los_Angeles",
        } = body;

        // Basic validations
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: "Email, password, and name are required." },
                { status: 400 }
            );
        }
        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters long." },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists." },
                { status: 409 }
            );
        }

        // Hash the password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create the user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
                currency,
                timezone,
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

        // Return the created user
        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error("Error creating user: ", error);

        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}
