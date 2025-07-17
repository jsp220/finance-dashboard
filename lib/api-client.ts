import { auth } from "@/lib/auth";

export async function authenticatedFetch(
    url: string,
    options: RequestInit = {}
) {
    const token = auth.getToken();

    if (!token) {
        throw new Error("No authentication token found");
    }

    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
}
