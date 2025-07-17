import { TransactionType } from "@/src/app/lib/enums/transaction";
import { PaginationMeta } from "@/src/app/lib/types/pagination";

export interface BasicTransaction {
    id: string;
    accountId: string;
    amount: string;
    type: TransactionType;
    category: string;
    description: string;
    date: string;
}

export interface Transaction extends BasicTransaction {
    createdAt: Date;
    updatedAt: Date;
}

export interface TransactionResponse {
    transactions: Transaction[];
    pagination: PaginationMeta;
}
