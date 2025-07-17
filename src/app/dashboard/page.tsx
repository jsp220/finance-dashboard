"use client";

import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { useEffect, useRef, useState } from "react";
import { BasicUser } from "@/src/app/lib/types/user";
import { Account } from "@/src/app/lib/types/account";
import { Accounts } from "@/src/app/lib/components/Accounts";
import { Transactions } from "@/src/app/lib/components/Transactions";

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<BasicUser | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);

    const refreshAccountsRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        // Get user info for display
        const userData = auth.getUser();
        if (!userData) {
            auth.logout();
            router.push("/");
            return;
        }
        setUser(userData);
    }, []);

    const handleLogout = () => {
        auth.logout();
        router.push("/");
    };

    // Callback function to receive accounts from Accounts component
    const handleAccountsUpdate = (updatedAccounts: Account[]) => {
        setAccounts(updatedAccounts);
    };

    // Receives the refresh function from Accounts component
    const handleRefreshFunctionUpdate = (refreshFn: () => void) => {
        refreshAccountsRef.current = refreshFn;
    };

    // Triggers accounts to refresh
    const triggerAccountsRefresh = () => {
        if (refreshAccountsRef.current) {
            refreshAccountsRef.current();
        }
    };

    // Show loading or redirect if not authenticated
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center">
            <div className="min-h-screen flex flex-col items-center w-xs md:w-2xl lg:w-4xl">
                {/* Header */}
                <header className="w-full flex justify-stretch items-center min-h-12 border-b-1">
                    <div className="md:w-3/4">
                        <h1 className="text-lg md:text-xl font-semibold">
                            Personal Finance Dashboard
                        </h1>
                    </div>
                    <div className="md:w-1/4 flex flex-col md:flex-row items-end md:items-center md:justify-between text-sm text-right">
                        <div>{user.email}</div>
                        <button
                            onClick={handleLogout}
                            className="hover:font-bold"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="w-full flex flex-col ">
                    <h2 className="py-4 md:text-lg font-semibold">
                        Welcome, {user.name}!
                    </h2>

                    <Accounts
                        onAccountsChange={handleAccountsUpdate}
                        onRefreshFunctionChange={handleRefreshFunctionUpdate}
                    />

                    <div className="m-2"></div>

                    <Transactions
                        accounts={accounts}
                        onAccountBalanceChange={triggerAccountsRefresh}
                    />
                </main>
            </div>
        </div>
    );
}
