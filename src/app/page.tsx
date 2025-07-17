"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserResponse } from "@/src/app/lib/types/user";
import { auth } from "@/lib/auth";

interface LoginResponse {
    message: string;
    user: UserResponse;
}

export default function Login() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        // Check if user is already logged in
        if (auth.isAuthenticated()) {
            router.push("/dashboard");
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to log in");
            }

            // Store user info in localStorage
            const loginData = data as LoginResponse;
            auth.login(loginData.user);

            // Redirect to dashboard/home
            router.push("/dashboard");
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen min-w-full flex flex-col space-y-6 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div>
                <h2 className="mt-6 text-center text-3xl font-extrabold">
                    Welcome Back
                </h2>
                <p className="mt-2 text-center">Personal Finance Dashboard</p>
            </div>

            <div className="mt-8 space-y-6 w-xs">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 w-full px-3 py-2 border border-gray-700 placeholder-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:z-10"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="mt-1 w-full px-3 py-2 border border-gray-700 placeholder-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:z-10"
                            placeholder="Enter your password"
                        />
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={
                            loading ||
                            formData.email === "" ||
                            formData.password === ""
                        }
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Signing In...
                            </div>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </div>

                <div className="h-0.5 flex items-center text-sm text-red-500">
                    {error ? error : " "}
                </div>

                <p className="text-sm text-center">
                    Don&apos;t have an account?{" "}
                    <button
                        type="button"
                        onClick={() => router.push("/signup")}
                        className="text-blue-400 hover:text-blue-300 underline"
                    >
                        Sign up here
                    </button>
                </p>
            </div>
        </div>
    );
}
