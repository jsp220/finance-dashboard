export interface BasicUser {
    id: string;
    email: string;
    name: string;
}

export interface User extends BasicUser {
    currency: string;
    timezone: string;
}

export interface UserResponse extends User {
    createdAt: Date;
    updatedAt: Date;
}
