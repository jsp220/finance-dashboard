import { AccountType, Currency } from "@/src/app/lib/enums/account";

export interface BasicAccount {
    id: string;
    name: string;
    userId: string;
    type: AccountType;
    balance: string;
    currency: Currency;
    isActive: boolean;
}

export interface Account extends BasicAccount {
    createdAt: Date;
    updatedAt: Date;
}
