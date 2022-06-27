/* eslint-disable max-len */
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
export function pipe<T001>(
    v001: T001
): T001;
export function pipe<T001, T002>(
    v001: T001,
    f001002: (v1: T001) => T002
): T002;
export function pipe<T001, T002, T003>(
    v001: T001,
    f001002: (a: T001) => T002,
    f002003: (b: T002) => T003
): T003;
export function pipe<T001, T002, T003, T004>(
    v001: T001,
    f001002: (a: T001) => T002,
    f002003: (b: T002) => T003,
    f003004: (c: T003) => T004
): T004;
export function pipe<T001, T002, T003, T004, T005>(
    v001: T001,
    f001002: (v001: T001) => T002,
    f002003: (v002: T002) => T003,
    f003004: (v003: T003) => T004,
    f004005: (v004: T004) => T005
): T005;
export function pipe<T001, T002, T003, T004, T005, T006>(
    v001: T001,
    f001002: (v001: T001) => T002,
    f002003: (v002: T002) => T003,
    f003004: (v003: T003) => T004,
    f004005: (v004: T004) => T005,
    f005006: (v005: T005) => T006
): T006;
export function pipe<T001, T002, T003, T004, T005, T006, T007>(
    v001: T001,
    f001002: (v001: T001) => T002,
    f002003: (v002: T002) => T003,
    f003004: (v003: T003) => T004,
    f004005: (v004: T004) => T005,
    f005006: (v005: T005) => T006,
    f006007: (v006: T006) => T007
): T007;
export function pipe<T001, T002, T003, T004, T005, T006, T007, T008>(
    v001: T001,
    f001002: (v001: T001) => T002,
    f002003: (v002: T002) => T003,
    f003004: (v003: T003) => T004,
    f004005: (v004: T004) => T005,
    f005006: (v005: T005) => T006,
    f006007: (v006: T006) => T007,
    f007008: (v007: T007) => T008
): T008;
export function pipe<T001, T002, T003, T004, T005, T006, T007, T008, T009>(
    v001: T001,
    f001002: (v001: T001) => T002,
    f002003: (v002: T002) => T003,
    f003004: (v003: T003) => T004,
    f004005: (v004: T004) => T005,
    f005006: (v005: T005) => T006,
    f006007: (v006: T006) => T007,
    f007008: (v007: T007) => T008,
    f008009: (v008: T008) => T009
): T009;
export function pipe<T001, T002, T003, T004, T005, T006, T007, T008, T009, T010>(
    v001: T001,
    f001002: (v001: T001) => T002,
    f002003: (v002: T002) => T003,
    f003004: (v003: T003) => T004,
    f004005: (v004: T004) => T005,
    f005006: (v005: T005) => T006,
    f006007: (v006: T006) => T007,
    f007008: (v007: T007) => T008,
    f008009: (v008: T008) => T009,
    f009010: (v009: T009) => T010
): T010;
export function pipe<T001, T002, T003, T004, T005, T006, T007, T008, T009, T010, T011>(
    v001: T001,
    f001002: (v001: T001) => T002,
    f002003: (v002: T002) => T003,
    f003004: (v003: T003) => T004,
    f004005: (v004: T004) => T005,
    f005006: (v005: T005) => T006,
    f006007: (v006: T006) => T007,
    f007008: (v007: T007) => T008,
    f008009: (v008: T008) => T009,
    f009010: (v009: T009) => T010,
    f010011: (v010: T010) => T011
): T011;
export function pipe<T001, T002, T003, T004, T005, T006, T007, T008, T009, T010, T011, T012>(
    v001: T001,
    f001002: (v001: T001) => T002,
    f002003: (v002: T002) => T003,
    f003004: (v003: T003) => T004,
    f004005: (v004: T004) => T005,
    f005006: (v005: T005) => T006,
    f006007: (v006: T006) => T007,
    f007008: (v007: T007) => T008,
    f008009: (v008: T008) => T009,
    f009010: (v009: T009) => T010,
    f010011: (v010: T010) => T011,
    f011012: (v011: T011) => T012
): T012;
export function pipe<T001, T002, T003, T004, T005, T006, T007, T008, T009, T010, T011, T012, T013>(
    v001: T001,
    f001002: (v001: T001) => T002,
    f002003: (v002: T002) => T003,
    f003004: (v003: T003) => T004,
    f004005: (v004: T004) => T005,
    f005006: (v005: T005) => T006,
    f006007: (v006: T006) => T007,
    f007008: (v007: T007) => T008,
    f008009: (v008: T008) => T009,
    f009010: (v009: T009) => T010,
    f010011: (v010: T010) => T011,
    f011012: (v011: T011) => T012,
    f012013: (v012: T012) => T013
): T013;
export function pipe<T001, T002, T003, T004, T005, T006, T007, T008, T009, T010, T011, T012, T013, T014>(
    v001: T001,
    f001002: (v001: T001) => T002,
    f002003: (v002: T002) => T003,
    f003004: (v003: T003) => T004,
    f004005: (v004: T004) => T005,
    f005006: (v005: T005) => T006,
    f006007: (v006: T006) => T007,
    f007008: (v007: T007) => T008,
    f008009: (v008: T008) => T009,
    f009010: (v009: T009) => T010,
    f010011: (v010: T010) => T011,
    f011012: (v011: T011) => T012,
    f012013: (v012: T012) => T013,
    f013014: (v013: T013) => T014
): T014;
export function pipe<T001, T002, T003, T004, T005, T006, T007, T008, T009, T010, T011, T012, T013, T014, T015>(
    v001: T001,
    f001002: (v001: T001) => T002,
    f002003: (v002: T002) => T003,
    f003004: (v003: T003) => T004,
    f004005: (v004: T004) => T005,
    f005006: (v005: T005) => T006,
    f006007: (v006: T006) => T007,
    f007008: (v007: T007) => T008,
    f008009: (v008: T008) => T009,
    f009010: (v009: T009) => T010,
    f010011: (v010: T010) => T011,
    f011012: (v011: T011) => T012,
    f012013: (v012: T012) => T013,
    f013014: (v013: T013) => T014,
    f014015: (v014: T014) => T015
): T015;

export function pipe<T001, T002, T003, T004, T005, T006, T007, T008, T009, T010, T011, T012, T013, T014, T015, T016>(
    v001: T001,
    f001002: (v001: T001) => T002,
    f002003: (v002: T002) => T003,
    f003004: (v003: T003) => T004,
    f004005: (v004: T004) => T005,
    f005006: (v005: T005) => T006,
    f006007: (v006: T006) => T007,
    f007008: (v007: T007) => T008,
    f008009: (v008: T008) => T009,
    f009010: (v009: T009) => T010,
    f010011: (v010: T010) => T011,
    f011012: (v011: T011) => T012,
    f012013: (v012: T012) => T013,
    f013014: (v013: T013) => T014,
    f014015: (v014: T014) => T015,
    f015016: (v015: T015) => T016
): T016;

export function pipe<T001, T002, T003, T004, T005, T006, T007, T008, T009, T010, T011, T012, T013, T014, T015, T016, T017>(
    v001: T001,
    f001002: (v001: T001) => T002,
    f002003: (v002: T002) => T003,
    f003004: (v003: T003) => T004,
    f004005: (v004: T004) => T005,
    f005006: (v005: T005) => T006,
    f006007: (v006: T006) => T007,
    f007008: (v007: T007) => T008,
    f008009: (v008: T008) => T009,
    f009010: (v009: T009) => T010,
    f010011: (v010: T010) => T011,
    f011012: (v011: T011) => T012,
    f012013: (v012: T012) => T013,
    f013014: (v013: T013) => T014,
    f014015: (v014: T014) => T015,
    f015016: (v015: T015) => T016,
    f016017: (v016: T016) => T017
): T017;

export function pipe<T001, T002, T003, T004, T005, T006, T007, T008, T009, T010, T011, T012, T013, T014, T015, T016, T017, T018>(
    v001: T001,
    f001002: (v001: T001) => T002,
    f002003: (v002: T002) => T003,
    f003004: (v003: T003) => T004,
    f004005: (v004: T004) => T005,
    f005006: (v005: T005) => T006,
    f006007: (v006: T006) => T007,
    f007008: (v007: T007) => T008,
    f008009: (v008: T008) => T009,
    f009010: (v009: T009) => T010,
    f010011: (v010: T010) => T011,
    f011012: (v011: T011) => T012,
    f012013: (v012: T012) => T013,
    f013014: (v013: T013) => T014,
    f014015: (v014: T014) => T015,
    f015016: (v015: T015) => T016,
    f016017: (v016: T016) => T017,
    f017018: (v017: T017) => T018
): T018;

export function pipe<T001, T002, T003, T004, T005, T006, T007, T008, T009, T010, T011, T012, T013, T014, T015, T016, T017, T018, T019>(
    v001: T001,
    f001002: (v001: T001) => T002,
    f002003: (v002: T002) => T003,
    f003004: (v003: T003) => T004,
    f004005: (v004: T004) => T005,
    f005006: (v005: T005) => T006,
    f006007: (v006: T006) => T007,
    f007008: (v007: T007) => T008,
    f008009: (v008: T008) => T009,
    f009010: (v009: T009) => T010,
    f010011: (v010: T010) => T011,
    f011012: (v011: T011) => T012,
    f012013: (v012: T012) => T013,
    f013014: (v013: T013) => T014,
    f014015: (v014: T014) => T015,
    f015016: (v015: T015) => T016,
    f016017: (v016: T016) => T017,
    f017018: (v017: T017) => T018,
    f018019: (v018: T018) => T019
): T019;

export function pipe<T001, T002, T003, T004, T005, T006, T007, T008, T009, T010, T011, T012, T013, T014, T015, T016, T017, T018, T019, T020>(
    v001: T001,
    f001002: (v001: T001) => T002,
    f002003: (v002: T002) => T003,
    f003004: (v003: T003) => T004,
    f004005: (v004: T004) => T005,
    f005006: (v005: T005) => T006,
    f006007: (v006: T006) => T007,
    f007008: (v007: T007) => T008,
    f008009: (v008: T008) => T009,
    f009010: (v009: T009) => T010,
    f010011: (v010: T010) => T011,
    f011012: (v011: T011) => T012,
    f012013: (v012: T012) => T013,
    f013014: (v013: T013) => T014,
    f014015: (v014: T014) => T015,
    f015016: (v015: T015) => T016,
    f016017: (v016: T016) => T017,
    f017018: (v017: T017) => T018,
    f018019: (v018: T018) => T019,
    f019020: (v019: T019) => T020
): T020;

export function pipe(
    a: unknown,
    f001002?: Function,
    f002003?: Function,
    f003004?: Function,
    f004005?: Function,
    f005006?: Function,
    f006007?: Function,
    f007008?: Function,
    f008009?: Function,
    f009010?: Function,
    f010011?: Function,
    f011012?: Function,
    f012013?: Function,
    f013014?: Function,
    f014015?: Function,
    f015016?: Function,
    f016017?: Function,
    f017018?: Function,
    f018019?: Function,
    f019020?: Function
): unknown {
    switch (arguments.length) {
        case 1:
            return a;
        case 2:
            return f001002!(a);
        case 3:
            return f002003!(f001002!(a));
        case 4:
            return f003004!(f002003!(f001002!(a)));
        case 5:
            return f004005!(f003004!(f002003!(f001002!(a))));
        case 6:
            return f005006!(f004005!(f003004!(f002003!(f001002!(a)))));
        case 7:
            return f006007!(f005006!(f004005!(f003004!(f002003!(f001002!(a))))));
        case 8:
            return f007008!(f006007!(f005006!(f004005!(f003004!(f002003!(f001002!(a)))))));
        case 9:
            return f008009!(f007008!(f006007!(f005006!(f004005!(f003004!(f002003!(f001002!(a))))))));
        case 10:
            return f009010!(f008009!(f007008!(f006007!(f005006!(f004005!(f003004!(f002003!(f001002!(a)))))))));
        case 11:
            return f010011!(f009010!(f008009!(f007008!(f006007!(f005006!(f004005!(f003004!(f002003!(f001002!(a))))))))));
        case 12:
            return f011012!(f010011!(f009010!(f008009!(f007008!(f006007!(f005006!(f004005!(f003004!(f002003!(f001002!(a)))))))))));
        case 13:
            return f012013!(f011012!(f010011!(f009010!(f008009!(f007008!(f006007!(f005006!(f004005!(f003004!(f002003!(f001002!(a))))))))))));
        case 14:
            return f013014!(f012013!(f011012!(f010011!(f009010!(f008009!(f007008!(f006007!(f005006!(f004005!(f003004!(f002003!(f001002!(a)))))))))))));
        case 15:
            return f014015!(f013014!(f012013!(f011012!(f010011!(f009010!(f008009!(f007008!(f006007!(f005006!(f004005!(f003004!(f002003!(f001002!(a))))))))))))));
        case 16:
            return f015016!(f014015!(f013014!(f012013!(f011012!(f010011!(f009010!(f008009!(f007008!(f006007!(f005006!(f004005!(f003004!(f002003!(f001002!(a)))))))))))))));
        case 17:
            return f016017!(f015016!(f014015!(f013014!(f012013!(f011012!(f010011!(f009010!(f008009!(f007008!(f006007!(f005006!(f004005!(f003004!(f002003!(f001002!(a))))))))))))))));
        case 18:
            return f017018!(f016017!(f015016!(f014015!(f013014!(f012013!(f011012!(f010011!(f009010!(f008009!(f007008!(f006007!(f005006!(f004005!(f003004!(f002003!(f001002!(a)))))))))))))))));
        case 19:
            return f018019!(f017018!(f016017!(f015016!(f014015!(f013014!(f012013!(f011012!(f010011!(f009010!(f008009!(f007008!(f006007!(f005006!(f004005!(f003004!(f002003!(f001002!(a))))))))))))))))));
        case 20:
            return f019020!(f018019!(f017018!(f016017!(f015016!(f014015!(f013014!(f012013!(f011012!(f010011!(f009010!(f008009!(f007008!(f006007!(f005006!(f004005!(f003004!(f002003!(f001002!(a)))))))))))))))))));
        default:
            return;
    }
}
