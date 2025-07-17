"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    useEffect(() => {
        // Only run auth check on certain pages
        const publicPaths = ["/", "/signup"];
        const currentPath = window.location.pathname;

        if (!publicPaths.includes(currentPath)) {
            if (!auth.isAuthenticated()) {
                router.push("/");
            }
        }
    }, [router]);

    return <>{children}</>;
}
