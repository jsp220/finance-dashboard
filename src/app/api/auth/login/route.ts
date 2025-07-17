import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// This route handles user login
// It expects a POST request with email and password in the body
// If successful, it returns user data (excluding password) and a JWT token
export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();
        const { email, password } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // Find user by email (INCLUDING passwordHash for verification)
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                currency: true,
                timezone: true,
                passwordHash: true, // ← We need this for login verification
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Remove passwordHash before sending response
        const { passwordHash: _, ...userWithoutPassword } = user;

        const token = jwt.sign(userWithoutPassword, process.env.JWT_SECRET!, {
            expiresIn: "72h",
        });

        return NextResponse.json(
            {
                message: "Login successful",
                user: userWithoutPassword,
                token,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error during login:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
