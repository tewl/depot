const factorialCache: Array<number> = [];

export function factorial(val: number): number {
    if (val === 0 || val === 1) {
        return 1;
    }
    else if (factorialCache[val] !== undefined) {
        return factorialCache[val];
    }
    else {
        const f = factorial(val - 1) * val;
        factorialCache[val] = f;
        return f;
    }

}
