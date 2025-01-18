export interface User {
    username: string;
    password: string;
    email?: string;
    tradingPortfolio: { symbol: string; shares: number }[];
}