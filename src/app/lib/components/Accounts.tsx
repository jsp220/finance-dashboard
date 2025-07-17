"use client";

import { useEffect, useState } from "react";
import { Account } from "@/src/app/lib/types/account";
import { capitalize, formatBalance } from "@/src/app/lib/utils";
import { CreateAccountModal } from "@/src/app/lib/modals/CreateAccountModal";
import { authenticatedFetch } from "@/lib/api-client";

export const Accounts = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loadingAccounts, setLoadingAccounts] = useState(false);
    const [accountsError, setAccountsError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Fetch accounts
    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        setLoadingAccounts(true);
        setAccountsError("");

        try {
            const response = await authenticatedFetch("/api/accounts");

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch accounts");
            }

            setAccounts(data.accounts || []);
        } catch (error) {
            if (error instanceof Error) {
                setAccountsError(error.message);
            } else {
                setAccountsError("An unexpected error occurred");
            }
        } finally {
            setLoadingAccounts(false);
        }
    };

    const handleStatusToggle = async (accountId: string, isActive: boolean) => {
        //TODO: Implement status toggle logic
        console.log(`Toggling status for account ${accountId} to ${!isActive}`);
    };

    const handleAddAccount = () => {
        setShowCreateModal(true);
    };

    const handleModalClose = () => {
        setShowCreateModal(false);
    };

    const handleAccountCreated = () => {
        // Refresh accounts list after successful creation
        fetchAccounts();
    };

    return (
        <>
            <section className="text-sm md:text-[16px] md:mt-3">
                <h3 className="font-semibold md:mb-4">Your Accounts</h3>

                {loadingAccounts ? (
                    <div className="text-center py-4">Loading accounts...</div>
                ) : accountsError ? (
                    <div className="text-center py-4">
                        <p className="mb-2">Error: {accountsError}</p>
                        <button
                            onClick={() => fetchAccounts()}
                            className="text-sm underline hover:no-underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : accounts.length === 0 ? (
                    <div className="text-center py-4">
                        <p className="mb-2">No accounts found.</p>
                        <p className="text-sm">
                            Create your first account to get started!
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto py-4">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b-2">
                                    <th className="text-left pb-2 px-1 font-medium">
                                        Account Name
                                    </th>
                                    <th className="text-left pb-2 px-1 font-medium">
                                        Type
                                    </th>
                                    <th className="text-right pb-2 px-1 font-medium">
                                        Balance
                                    </th>
                                    <th className="text-center pb-2 px-1 font-medium">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.map((account) => (
                                    <tr
                                        key={account.id}
                                        className="border-b hover:bg-gray-300 dark:hover:bg-gray-800"
                                    >
                                        <td className="py-3 px-1">
                                            {account.name}
                                        </td>
                                        <td className="py-3 px-1">
                                            {capitalize(account.type)}
                                        </td>
                                        <td
                                            className={`py-3 px-1 text-right font-mono ${
                                                parseFloat(account.balance) < 0
                                                    ? "text-red-500 dark:text-red-700"
                                                    : ""
                                            }`}
                                        >
                                            {formatBalance(
                                                account.balance,
                                                account.currency
                                            )}
                                        </td>
                                        <td className="py-3 px-1 md:flex md:justify-center">
                                            <button
                                                onClick={() =>
                                                    handleStatusToggle(
                                                        account.id,
                                                        account.isActive
                                                    )
                                                }
                                                className="flex justify-center"
                                            >
                                                <p
                                                    className={`w-15 text-sm rounded text-center ${
                                                        account.isActive
                                                            ? "bg-green-500 dark:bg-green-700"
                                                            : "bg-red-500 dark:bg-red-700"
                                                    }`}
                                                >
                                                    {account.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </p>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Add Account Button */}
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={handleAddAccount}
                        className="px-4 py-2 border border-gray-700 dark:border-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors"
                    >
                        + Add Account
                    </button>
                </div>
            </section>

            <CreateAccountModal
                isOpen={showCreateModal}
                onClose={handleModalClose}
                onSuccess={handleAccountCreated}
            />
        </>
    );
};
