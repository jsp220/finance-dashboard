"use client";

import { useEffect, useState } from "react";
import { Transaction } from "@/src/app/lib/types/transaction";
import { Account } from "@/src/app/lib/types/account";
import { capitalize, formatBalance } from "@/src/app/lib/utils";
import { CreateTransactionModal } from "@/src/app/lib/modals/CreateTransactionModal";
import { authenticatedFetch } from "@/lib/api-client";
import { PaginationMeta } from "@/src/app/lib/types/pagination";
import { Currency } from "@/src/app/lib/enums/account";

interface TransactionsProps {
    accounts: Account[];
    onAccountBalanceChange: () => void;
}

export const Transactions = ({
    accounts,
    onAccountBalanceChange,
}: TransactionsProps) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [transactionsError, setTransactionsError] = useState("");

    // Filters & Pagination
    const [selectedAccount, setSelectedAccount] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [selectedType, setSelectedType] = useState<string>("");
    const [pagination, setPagination] = useState<PaginationMeta>({
        offset: 0,
        limit: 20,
        total: 0,
        hasNext: false,
    });

    const [showCreateModal, setShowCreateModal] = useState(false);

    // Fetch transactions
    useEffect(() => {
        fetchTransactions();
    }, [selectedAccount, selectedCategory, selectedType]);

    const fetchTransactions = async (offset = 0) => {
        setLoadingTransactions(true);
        setTransactionsError("");

        try {
            // Build query parameters
            const params = new URLSearchParams({
                offset: offset.toString(),
                limit: "20",
            });

            if (selectedAccount) params.append("accountId", selectedAccount);
            if (selectedCategory) params.append("category", selectedCategory);
            if (selectedType) params.append("type", selectedType);

            const response = await authenticatedFetch(
                `/api/transactions?${params}`
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch transactions");
            }

            setTransactions(data.transactions);

            setPagination(data.pagination);
        } catch (error) {
            if (error instanceof Error) {
                setTransactionsError(error.message);
            } else {
                setTransactionsError("An unexpected error occurred");
            }
        } finally {
            setLoadingTransactions(false);
        }
    };

    const loadMore = () => {
        if (pagination.hasNext && !loadingTransactions) {
            fetchTransactions(pagination.offset + pagination.limit);
        }
    };

    const resetFilters = () => {
        setSelectedAccount("");
        setSelectedCategory("");
        setSelectedType("");
    };

    const getAccountName = (accountId: string): string => {
        const account = accounts.find((acc) => acc.id === accountId);
        return account ? account.name : "Unknown Account";
    };

    const getAccountCurrency = (accountId: string): Currency => {
        const account = accounts.find((acc) => acc.id === accountId);
        return account ? account.currency : Currency.USD;
    };

    const handleAddTransaction = () => {
        setShowCreateModal(true);
    };

    const handleModalClose = () => {
        setShowCreateModal(false);
    };

    const handleTransactionCreated = () => {
        fetchTransactions(pagination.offset);
        onAccountBalanceChange();
    };

    return (
        <>
            <section className="text-sm md:text-[16px] mt-3">
                <h3 className="font-semibold">Recent Transactions</h3>

                {/* Filters */}
                <div className="py-4 flex flex-wrap gap-2">
                    <select
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800"
                    >
                        <option value="">All Accounts</option>
                        {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800"
                    >
                        <option value="">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                        <option value="transfer">Transfer</option>
                        <option value="refund">Refund</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Filter by category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800"
                    />

                    {(selectedAccount || selectedCategory || selectedType) && (
                        <button
                            onClick={resetFilters}
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {loadingTransactions && transactions.length === 0 ? (
                    <div className="text-center py-4">
                        Loading transactions...
                    </div>
                ) : transactionsError ? (
                    <div className="text-center py-4">
                        <p className="mb-2">Error: {transactionsError}</p>
                        <button
                            onClick={() => fetchTransactions()}
                            className="text-sm underline hover:no-underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-4">
                        <p className="mb-2">No transactions found.</p>
                        <p className="text-sm">
                            Start adding transactions to track your spending!
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto py-4">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b-2">
                                    <th className="text-left pb-2 px-1 font-medium">
                                        Date
                                    </th>
                                    <th className="text-left pb-2 px-1 font-medium">
                                        Description
                                    </th>
                                    <th className="text-left pb-2 px-1 font-medium">
                                        Account
                                    </th>
                                    <th className="text-left pb-2 px-1 font-medium">
                                        Category
                                    </th>
                                    <th className="text-right pb-2 px-1 font-medium">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="border-b hover:bg-gray-300 dark:hover:bg-gray-800"
                                    >
                                        <td className="py-3 px-1">
                                            {transaction.date}
                                        </td>
                                        <td className="py-3 px-1">
                                            {transaction.description || "—"}
                                        </td>
                                        <td className="py-3 px-1">
                                            {getAccountName(
                                                transaction.accountId
                                            )}
                                        </td>
                                        <td className="py-3 px-1">
                                            {capitalize(transaction.category)}
                                        </td>
                                        <td
                                            className={`py-3 px-1 text-right font-mono ${
                                                parseFloat(transaction.amount) <
                                                0
                                                    ? "text-red-700 dark:text-red-500"
                                                    : "text-green-700 dark:text-green-500"
                                            }`}
                                        >
                                            {formatBalance(
                                                transaction.amount,
                                                getAccountCurrency(
                                                    transaction.accountId
                                                )
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Arrow Pagination */}
                        {pagination.total > pagination.limit && (
                            <div className="flex justify-center items-center mt-4 space-x-4">
                                <button
                                    onClick={() =>
                                        fetchTransactions(
                                            Math.max(
                                                0,
                                                pagination.offset -
                                                    pagination.limit
                                            )
                                        )
                                    }
                                    disabled={
                                        pagination.offset === 0 ||
                                        loadingTransactions
                                    }
                                    className="px-3 py-2 border border-gray-700 dark:border-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ← Previous
                                </button>

                                <span className="text-sm opacity-60">
                                    Page{" "}
                                    {Math.floor(
                                        pagination.offset / pagination.limit
                                    ) + 1}{" "}
                                    of{" "}
                                    {Math.ceil(
                                        pagination.total / pagination.limit
                                    )}
                                </span>

                                <button
                                    onClick={() =>
                                        fetchTransactions(
                                            pagination.offset + pagination.limit
                                        )
                                    }
                                    disabled={
                                        !pagination.hasNext ||
                                        loadingTransactions
                                    }
                                    className="px-3 py-2 border border-gray-700 dark:border-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next →
                                </button>
                            </div>
                        )}

                        {/* Pagination Info */}
                        <div className="text-center text-sm mt-2 opacity-60">
                            {`Showing ${pagination.offset + 1}-${
                                pagination.offset + transactions.length
                            } of ${pagination.total} transactions`}
                        </div>
                    </div>
                )}

                {/* Add Transaction Button */}
                <div className="flex justify-center pb-4">
                    <button
                        onClick={handleAddTransaction}
                        className="px-4 py-2 border border-gray-700 dark:border-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors"
                    >
                        + Add a Transaction
                    </button>
                </div>
            </section>

            <CreateTransactionModal
                isOpen={showCreateModal}
                onClose={handleModalClose}
                onSuccess={handleTransactionCreated}
                accounts={accounts}
            />
        </>
    );
};
