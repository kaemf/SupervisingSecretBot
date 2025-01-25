export default function TimeSubscription(amount: number, number?: boolean): any {
    const prices = {
        33 : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month
        150 : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 month
        777 : "unlimit"
    } as {[key: number]: Date | string},

    pricesMonth = {
        33 : 1,
        150 : 6,
        777 : "unlimit"
    } as {[key: number]: number | string};

    return number ? pricesMonth[amount] : prices[amount];
}