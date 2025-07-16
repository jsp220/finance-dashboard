"use client";

import React, { useState } from "react";
import { UserResponse } from "../lib/types/user";

export default function SignUp() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        currency: "USD",
        timezone: "America/Los_Angeles",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [createdUser, setCreatedUser] = useState<UserResponse | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create account");
            }

            setSuccess(true);
            setCreatedUser(data);
            setFormData({
                email: "",
                password: "",
                name: "",
                currency: "USD",
                timezone: "America/Los_Angeles",
            });
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

    if (success) {
        alert("Account created successfully!");
        localStorage.setItem("userId", createdUser?.id || "");
    }

    return (
        <div className="min-h-screen min-w-full flex flex-col space-y-6 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div>
                <h2 className="mt-6 text-center text-3xl font-extrabold">
                    Create Your Account
                </h2>
                <p className="mt-2 text-center">Personal Finance Dashboard</p>
            </div>

            <form className="mt-8 space-y-6 w-xs" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    {/* Form Fields for Name, Email, Password, Currency, Timezone */}
                    <div>
                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 w-full px-3 py-2 border border-gray-700 placeholder-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:z-10"
                            placeholder="Enter your full name"
                        />
                    </div>

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
                            placeholder="Enter your password (min 8 characters)"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="currency">Currency</label>
                            <select
                                id="currency"
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                className="mt-1 w-full px-3 py-2 border border-gray-700 placeholder-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:z-10"
                            >
                                <option value="USD">USD</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="timezone">Timezone</label>
                            <select
                                id="timezone"
                                name="timezone"
                                value={formData.timezone}
                                onChange={handleChange}
                                className="mt-1 w-full px-3 py-2 border border-gray-700 placeholder-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:z-10"
                            >
                                <option value="America/Los_Angeles">
                                    Pacific Time
                                </option>
                                <option value="America/Denver">
                                    Mountain Time
                                </option>
                                <option value="America/Chicago">
                                    Central Time
                                </option>
                                <option value="America/New_York">
                                    Eastern Time
                                </option>
                                <option value="UTC">UTC</option>
                            </select>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mx-3">
                        <h3 className="text-sm font-medium text-red-500">
                            Error creating account:
                        </h3>
                        <div className="mt-1 text-sm text-red-500">{error}</div>
                    </div>
                )}

                <div>
                    <button
                        type="submit"
                        disabled={
                            loading ||
                            formData.email === "" ||
                            formData.password === "" ||
                            formData.name === ""
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
                                Creating Account...
                            </div>
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
