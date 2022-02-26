/* eslint-disable @typescript-eslint/ban-types */

/**
 * Passes a value through a series of functions.  The value returned from each
 * function is passed in as the argument to the next function.
 *
 * @example
 * // pipe() can make chained transformations that return a Result easy to write
 * // using the bindResult() function:
 * const result = pipe(
 *     "16",
 *     parse,
 *     (r) => bindResult(sqrt, r),
 *     (r) => bindResult(stringify, r)
 * );
 *
 * @example
 * // pipe() can also make chained transformations that return Option easy to
 * // write.
 *
 * @return The value returned from the last function.
 */
export function pipe<TA>(a: TA): TA;
export function pipe<TA, TB>(a: TA, ab: (a: TA) => TB): TB;
export function pipe<TA, TB, TC>(a: TA, ab: (a: TA) => TB, bc: (b: TB) => TC): TC;
export function pipe<TA, TB, TC, TD>(a: TA, ab: (a: TA) => TB, bc: (b: TB) => TC, cd: (c: TC) => TD): TD;
export function pipe<TA, TB, TC, TD, TE>(
    a: TA,
    ab: (a: TA) => TB,
    bc: (b: TB) => TC,
    cd: (c: TC) => TD,
    de: (d: TD) => TE
): TE;
export function pipe<TA, TB, TC, TD, TE, TF>(
    a: TA,
    ab: (a: TA) => TB,
    bc: (b: TB) => TC,
    cd: (c: TC) => TD,
    de: (d: TD) => TE,
    ef: (e: TE) => TF
): TF;
export function pipe<TA, TB, TC, TD, TE, TF, TG>(
    a: TA,
    ab: (a: TA) => TB,
    bc: (b: TB) => TC,
    cd: (c: TC) => TD,
    de: (d: TD) => TE,
    ef: (e: TE) => TF,
    fg: (f: TF) => TG
): TG;
export function pipe<TA, TB, TC, TD, TE, TF, TG, TH>(
    a: TA,
    ab: (a: TA) => TB,
    bc: (b: TB) => TC,
    cd: (c: TC) => TD,
    de: (d: TD) => TE,
    ef: (e: TE) => TF,
    fg: (f: TF) => TG,
    gh: (g: TG) => TH
): TH;
export function pipe<TA, TB, TC, TD, TE, TF, TG, TH, TI>(
    a: TA,
    ab: (a: TA) => TB,
    bc: (b: TB) => TC,
    cd: (c: TC) => TD,
    de: (d: TD) => TE,
    ef: (e: TE) => TF,
    fg: (f: TF) => TG,
    gh: (g: TG) => TH,
    hi: (h: TH) => TI
): TI;
export function pipe<TA, TB, TC, TD, TE, TF, TG, TH, TI, TJ>(
    a: TA,
    ab: (a: TA) => TB,
    bc: (b: TB) => TC,
    cd: (c: TC) => TD,
    de: (d: TD) => TE,
    ef: (e: TE) => TF,
    fg: (f: TF) => TG,
    gh: (g: TG) => TH,
    hi: (h: TH) => TI,
    ij: (i: TI) => TJ
): TJ;
export function pipe<TA, TB, TC, TD, TE, TF, TG, TH, TI, TJ, TK>(
    a: TA,
    ab: (a: TA) => TB,
    bc: (b: TB) => TC,
    cd: (c: TC) => TD,
    de: (d: TD) => TE,
    ef: (e: TE) => TF,
    fg: (f: TF) => TG,
    gh: (g: TG) => TH,
    hi: (h: TH) => TI,
    ij: (i: TI) => TJ,
    jk: (j: TJ) => TK
): TK;
export function pipe<TA, TB, TC, TD, TE, TF, TG, TH, TI, TJ, TK, TL>(
    a: TA,
    ab: (a: TA) => TB,
    bc: (b: TB) => TC,
    cd: (c: TC) => TD,
    de: (d: TD) => TE,
    ef: (e: TE) => TF,
    fg: (f: TF) => TG,
    gh: (g: TG) => TH,
    hi: (h: TH) => TI,
    ij: (i: TI) => TJ,
    jk: (j: TJ) => TK,
    kl: (k: TK) => TL
): TL;
export function pipe<TA, TB, TC, TD, TE, TF, TG, TH, TI, TJ, TK, TL, TM>(
    a: TA,
    ab: (a: TA) => TB,
    bc: (b: TB) => TC,
    cd: (c: TC) => TD,
    de: (d: TD) => TE,
    ef: (e: TE) => TF,
    fg: (f: TF) => TG,
    gh: (g: TG) => TH,
    hi: (h: TH) => TI,
    ij: (i: TI) => TJ,
    jk: (j: TJ) => TK,
    kl: (k: TK) => TL,
    lm: (l: TL) => TM
): TM;
export function pipe<TA, TB, TC, TD, TE, TF, TG, TH, TI, TJ, TK, TL, TM, TN>(
    a: TA,
    ab: (a: TA) => TB,
    bc: (b: TB) => TC,
    cd: (c: TC) => TD,
    de: (d: TD) => TE,
    ef: (e: TE) => TF,
    fg: (f: TF) => TG,
    gh: (g: TG) => TH,
    hi: (h: TH) => TI,
    ij: (i: TI) => TJ,
    jk: (j: TJ) => TK,
    kl: (k: TK) => TL,
    lm: (l: TL) => TM,
    mn: (m: TM) => TN
): TN;
export function pipe<TA, TB, TC, TD, TE, TF, TG, TH, TI, TJ, TK, TL, TM, TN, TO>(
    a: TA,
    ab: (a: TA) => TB,
    bc: (b: TB) => TC,
    cd: (c: TC) => TD,
    de: (d: TD) => TE,
    ef: (e: TE) => TF,
    fg: (f: TF) => TG,
    gh: (g: TG) => TH,
    hi: (h: TH) => TI,
    ij: (i: TI) => TJ,
    jk: (j: TJ) => TK,
    kl: (k: TK) => TL,
    lm: (l: TL) => TM,
    mn: (m: TM) => TN,
    no: (n: TN) => TO
): TO;

export function pipe<TA, TB, TC, TD, TE, TF, TG, TH, TI, TJ, TK, TL, TM, TN, TO, TP>(
    a: TA,
    ab: (a: TA) => TB,
    bc: (b: TB) => TC,
    cd: (c: TC) => TD,
    de: (d: TD) => TE,
    ef: (e: TE) => TF,
    fg: (f: TF) => TG,
    gh: (g: TG) => TH,
    hi: (h: TH) => TI,
    ij: (i: TI) => TJ,
    jk: (j: TJ) => TK,
    kl: (k: TK) => TL,
    lm: (l: TL) => TM,
    mn: (m: TM) => TN,
    no: (n: TN) => TO,
    op: (o: TO) => TP
): TP;

export function pipe<TA, TB, TC, TD, TE, TF, TG, TH, TI, TJ, TK, TL, TM, TN, TO, TP, TQ>(
    a: TA,
    ab: (a: TA) => TB,
    bc: (b: TB) => TC,
    cd: (c: TC) => TD,
    de: (d: TD) => TE,
    ef: (e: TE) => TF,
    fg: (f: TF) => TG,
    gh: (g: TG) => TH,
    hi: (h: TH) => TI,
    ij: (i: TI) => TJ,
    jk: (j: TJ) => TK,
    kl: (k: TK) => TL,
    lm: (l: TL) => TM,
    mn: (m: TM) => TN,
    no: (n: TN) => TO,
    op: (o: TO) => TP,
    pq: (p: TP) => TQ
): TQ;

export function pipe<TA, TB, TC, TD, TE, TF, TG, TH, TI, TJ, TK, TL, TM, TN, TO, TP, TQ, TR>(
    a: TA,
    ab: (a: TA) => TB,
    bc: (b: TB) => TC,
    cd: (c: TC) => TD,
    de: (d: TD) => TE,
    ef: (e: TE) => TF,
    fg: (f: TF) => TG,
    gh: (g: TG) => TH,
    hi: (h: TH) => TI,
    ij: (i: TI) => TJ,
    jk: (j: TJ) => TK,
    kl: (k: TK) => TL,
    lm: (l: TL) => TM,
    mn: (m: TM) => TN,
    no: (n: TN) => TO,
    op: (o: TO) => TP,
    pq: (p: TP) => TQ,
    qr: (q: TQ) => TR
): TR;

export function pipe<TA, TB, TC, TD, TE, TF, TG, TH, TI, TJ, TK, TL, TM, TN, TO, TP, TQ, TR, TS>(
    a: TA,
    ab: (a: TA) => TB,
    bc: (b: TB) => TC,
    cd: (c: TC) => TD,
    de: (d: TD) => TE,
    ef: (e: TE) => TF,
    fg: (f: TF) => TG,
    gh: (g: TG) => TH,
    hi: (h: TH) => TI,
    ij: (i: TI) => TJ,
    jk: (j: TJ) => TK,
    kl: (k: TK) => TL,
    lm: (l: TL) => TM,
    mn: (m: TM) => TN,
    no: (n: TN) => TO,
    op: (o: TO) => TP,
    pq: (p: TP) => TQ,
    qr: (q: TQ) => TR,
    rs: (r: TR) => TS
): TS;

export function pipe<TA, TB, TC, TD, TE, TF, TG, TH, TI, TJ, TK, TL, TM, TN, TO, TP, TQ, TR, TS, TT>(
    a: TA,
    ab: (a: TA) => TB,
    bc: (b: TB) => TC,
    cd: (c: TC) => TD,
    de: (d: TD) => TE,
    ef: (e: TE) => TF,
    fg: (f: TF) => TG,
    gh: (g: TG) => TH,
    hi: (h: TH) => TI,
    ij: (i: TI) => TJ,
    jk: (j: TJ) => TK,
    kl: (k: TK) => TL,
    lm: (l: TL) => TM,
    mn: (m: TM) => TN,
    no: (n: TN) => TO,
    op: (o: TO) => TP,
    pq: (p: TP) => TQ,
    qr: (q: TQ) => TR,
    rs: (r: TR) => TS,
    st: (s: TS) => TT
): TT;

export function pipe(
    a: unknown,
    ab?: Function,
    bc?: Function,
    cd?: Function,
    de?: Function,
    ef?: Function,
    fg?: Function,
    gh?: Function,
    hi?: Function,
    ij?: Function,
    jk?: Function,
    kl?: Function,
    lm?: Function,
    mn?: Function,
    no?: Function,
    op?: Function,
    pq?: Function,
    qr?: Function,
    rs?: Function,
    st?: Function
): unknown
{
    switch (arguments.length)
    {
        case 1:
            return a;
        case 2:
            return ab!(a);
        case 3:
            return bc!(ab!(a));
        case 4:
            return cd!(bc!(ab!(a)));
        case 5:
            return de!(cd!(bc!(ab!(a))));
        case 6:
            return ef!(de!(cd!(bc!(ab!(a)))));
        case 7:
            return fg!(ef!(de!(cd!(bc!(ab!(a))))));
        case 8:
            return gh!(fg!(ef!(de!(cd!(bc!(ab!(a)))))));
        case 9:
            return hi!(gh!(fg!(ef!(de!(cd!(bc!(ab!(a))))))));
        case 10:
            return ij!(hi!(gh!(fg!(ef!(de!(cd!(bc!(ab!(a)))))))));
        case 11:
            return jk!(ij!(hi!(gh!(fg!(ef!(de!(cd!(bc!(ab!(a))))))))));
        case 12:
            return kl!(jk!(ij!(hi!(gh!(fg!(ef!(de!(cd!(bc!(ab!(a)))))))))));
        case 13:
            return lm!(kl!(jk!(ij!(hi!(gh!(fg!(ef!(de!(cd!(bc!(ab!(a))))))))))));
        case 14:
            return mn!(lm!(kl!(jk!(ij!(hi!(gh!(fg!(ef!(de!(cd!(bc!(ab!(a)))))))))))));
        case 15:
            return no!(mn!(lm!(kl!(jk!(ij!(hi!(gh!(fg!(ef!(de!(cd!(bc!(ab!(a))))))))))))));
        case 16:
            return op!(no!(mn!(lm!(kl!(jk!(ij!(hi!(gh!(fg!(ef!(de!(cd!(bc!(ab!(a)))))))))))))));
        case 17:
            return pq!(op!(no!(mn!(lm!(kl!(jk!(ij!(hi!(gh!(fg!(ef!(de!(cd!(bc!(ab!(a))))))))))))))));
        case 18:
            return qr!(pq!(op!(no!(mn!(lm!(kl!(jk!(ij!(hi!(gh!(fg!(ef!(de!(cd!(bc!(ab!(a)))))))))))))))));
        case 19:
            return rs!(qr!(pq!(op!(no!(mn!(lm!(kl!(jk!(ij!(hi!(gh!(fg!(ef!(de!(cd!(bc!(ab!(a))))))))))))))))));
        case 20:
            return st!(rs!(qr!(pq!(op!(no!(mn!(lm!(kl!(jk!(ij!(hi!(gh!(fg!(ef!(de!(cd!(bc!(ab!(a)))))))))))))))))));
        default:
            return;
    }
}
