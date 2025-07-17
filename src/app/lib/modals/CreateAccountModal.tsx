"use client";

import { useState } from "react";
import { authenticatedFetch } from "@/lib/api-client";

interface CreateAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateAccountModal = ({
    isOpen,
    onClose,
    onSuccess,
}: CreateAccountModalProps) => {
    const [formData, setFormData] = useState({
        name: "",
        type: "checking",
        balance: "",
        currency: "USD",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
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
            const accountData = {
                name: formData.name,
                type: formData.type,
                balance: formData.balance ? parseFloat(formData.balance) : 0,
                currency: formData.currency,
            };

            const response = await authenticatedFetch("/api/accounts", {
                method: "POST",
                body: JSON.stringify(accountData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create account");
            }

            // Success - close modal and trigger refresh
            handleClose();
            onSuccess();
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: "",
            type: "checking",
            balance: "",
            currency: "USD",
        });
        setError("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md mx-4">
                <div className="w-full flex justify-between items-start">
                    <h2 className="text-lg font-semibold mb-4">
                        Add New Account
                    </h2>
                    <button
                        onClick={handleClose}
                        className="w-5 rounded-sm text-lg text-gray-500 hover:bg-gray-300 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    >
                        &times;
                    </button>
                </div>
                <div onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium mb-1"
                            >
                                Account Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleFormChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:border-blue-500"
                                placeholder="My Checking Account"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="type"
                                className="block text-sm font-medium mb-1"
                            >
                                Account Type
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleFormChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:border-blue-500"
                            >
                                <option value="checking">Checking</option>
                                <option value="savings">Savings</option>
                                <option value="credit">Credit</option>
                                <option value="investment">Investment</option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="balance"
                                className="block text-sm font-medium mb-1"
                            >
                                Initial Balance (optional)
                            </label>
                            <input
                                id="balance"
                                name="balance"
                                type="number"
                                step="1.00"
                                value={formData.balance}
                                onChange={handleFormChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:border-blue-500"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="currency"
                                className="block text-sm font-medium mb-1"
                            >
                                Currency
                            </label>
                            <select
                                id="currency"
                                name="currency"
                                value={formData.currency}
                                onChange={handleFormChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:border-blue-500"
                            >
                                <option value="USD">USD</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md">
                            <p className="text-sm">Error: {error}</p>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading || !formData.name.trim()}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating..." : "Create Account"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
