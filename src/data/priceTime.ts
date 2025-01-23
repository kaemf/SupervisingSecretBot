export default function TimeSubscription(amount: number, number?: boolean): any {
    const prices = {
        35 : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month
        50 : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 month
        150 : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 12 month
    } as {[key: number]: Date},

    pricesMonth = {
        35 : 1,
        50 : 6,
        150 : 12
    } as {[key: number]: number};

    return number ? pricesMonth[amount] : prices[amount];
}