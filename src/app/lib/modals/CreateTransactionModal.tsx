import { authenticatedFetch } from "@/lib/api-client";
import { TransactionType } from "@/src/app/lib/enums/transaction";
import { Account } from "@/src/app/lib/types/account";
import { useState } from "react";

interface CreateTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    accounts: Account[];
}

export const CreateTransactionModal = ({
    isOpen,
    onClose,
    onSuccess,
    accounts,
}: CreateTransactionModalProps) => {
    const [formData, setFormData] = useState({
        accountId: "",
        amount: "",
        type: TransactionType.Expense,
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFormChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
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
            const transactionData = {
                accountId: formData.accountId,
                amount: Math.abs(parseFloat(formData.amount)),
                type: formData.type,
                category: formData.category,
                description: formData.description || null,
                date: formData.date,
            };

            if (transactionData.amount === 0) {
                throw new Error("Amount cannot be zero");
            }

            const response = await authenticatedFetch("/api/transactions", {
                method: "POST",
                body: JSON.stringify(transactionData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create transaction");
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
            accountId: "",
            amount: "",
            type: TransactionType.Expense,
            category: "",
            description: "",
            date: new Date().toISOString().split("T")[0],
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
                        Add New Transaction
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
                                htmlFor="accountId"
                                className="block text-sm font-medium mb-1"
                            >
                                Account
                            </label>
                            <select
                                id="accountId"
                                name="accountId"
                                required
                                value={formData.accountId}
                                onChange={handleFormChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Select an account</option>
                                {accounts
                                    .filter((account) => account.isActive)
                                    .map((account) => (
                                        <option
                                            key={account.id}
                                            value={account.id}
                                        >
                                            {account.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="amount"
                                    className="block text-sm font-medium mb-1"
                                >
                                    Amount
                                </label>
                                <input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    required
                                    value={formData.amount}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:border-blue-500"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="type"
                                    className="block text-sm font-medium mb-1"
                                >
                                    Type
                                </label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:border-blue-500"
                                >
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                    <option value="refund">Refund</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="category"
                                className="block text-sm font-medium mb-1"
                            >
                                Category
                            </label>
                            <input
                                id="category"
                                name="category"
                                type="text"
                                required
                                value={formData.category}
                                onChange={handleFormChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:border-blue-500"
                                placeholder="groceries, gas, salary, etc."
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="description"
                                className="block text-sm font-medium mb-1"
                            >
                                Description (optional)
                            </label>
                            <input
                                id="description"
                                name="description"
                                type="text"
                                value={formData.description}
                                onChange={handleFormChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:border-blue-500"
                                placeholder="Trader Joe's, Amazon purchase, etc."
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="date"
                                className="block text-sm font-medium mb-1"
                            >
                                Date
                            </label>
                            <input
                                id="date"
                                name="date"
                                type="date"
                                required
                                value={formData.date}
                                onChange={handleFormChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md">
                            <p className="text-sm">{error}</p>
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
                            disabled={
                                loading ||
                                !formData.accountId ||
                                !formData.amount ||
                                !formData.category
                            }
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating..." : "Create Transaction"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
