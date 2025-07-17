import { Currency } from "@/src/app/lib/enums/account-type";

export const formatBalance = (balance: string, currency: Currency): string => {
    switch (currency) {
        case Currency.USD:
            const usdBalanceWithCommas = parseFloat(balance).toLocaleString(
                "en-US",
                {
                    style: "currency",
                    currency: "USD",
                    currencyDisplay: "symbol",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }
            );
            return `${usdBalanceWithCommas}`;
        default:
            const defaultBalanceWithCommas = parseFloat(balance).toLocaleString(
                "en-US",
                {
                    style: "currency",
                    currency: "USD",
                    currencyDisplay: "symbol",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }
            );
            return `${defaultBalanceWithCommas}`;
    }
};
