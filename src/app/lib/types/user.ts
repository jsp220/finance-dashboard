export interface User {
    id: string;
    email: string;
    name: string;
    currency: string;
    timezone: string;
}

export interface UserResponse extends User {
    createdAt: Date;
    updatedAt: Date;
}
