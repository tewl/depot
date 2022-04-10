import { MakePropsNonNullable,
         MakePropsNonNullableAndRequired,
         MakePropsOptional,
         MakePropsRequired,
         RecursivePartial} from "./typeUtils";


interface IAllRequired {
    propA: number;
    propB: boolean;
    propC: string;
    propD: Promise<number>;
}

type SomeOptional = MakePropsOptional<IAllRequired, "propB" | "propC">;


////////////////////////////////////////////////////////////////////////////////
// MakePropsOptional
////////////////////////////////////////////////////////////////////////////////

const test1: SomeOptional = {
    propA: 3,                   // Required - if removed, will not compile
    // propB                    // optional - absent
    propC: "foo",               // optional - present
    propD: Promise.resolve(5)   // Required - if removed, will not compile
};


////////////////////////////////////////////////////////////////////////////////
// MakePropsRequired
////////////////////////////////////////////////////////////////////////////////

type AllRequired2 = MakePropsRequired<SomeOptional, "propC">;

const test2: AllRequired2 = {
    propA: 3,                   // Required - if removed, will not compile
    // propB                    // optional - absent
    propC: "foo",               // Required - if removed, will not compile
    propD: Promise.resolve(5)   // Required - if removed, will not compile
};


////////////////////////////////////////////////////////////////////////////////
// MakePropsNonNullable
////////////////////////////////////////////////////////////////////////////////

interface ISomeNullable {
    propA: number;
    propB: undefined | number;
    propC: null | number;
}

type NoNulls = MakePropsNonNullable<ISomeNullable, "propB" | "propC">;

const test3: NoNulls = {
    propA: 3,                   // Required - if removed, will not compile
    propB: 3,                   // Must be number.  Will not compile if undefined
    propC: 3                    // Must be number.  Will not compile if null
};


////////////////////////////////////////////////////////////////////////////////
// MakePropsNonNullableAndRequired
////////////////////////////////////////////////////////////////////////////////

interface ISomeOptionalAndNullable {
    propA: number;
    propB?: undefined | number;
    propC?: null | number;
}

type AllRequiredNoNulls = MakePropsNonNullableAndRequired<ISomeOptionalAndNullable, "propB" | "propC">;

const test4: AllRequiredNoNulls = {
    propA: 3,                   // Required - if removed, will not compile
    propB: 3,                   // Must be number.  Will not compile if undefined
    propC: 3                    // Must be number.  Will not compile if null
};


////////////////////////////////////////////////////////////////////////////////
// RecursivePartial
////////////////////////////////////////////////////////////////////////////////

interface ITypeA {
    prop1: {
        prop1a: number,
        prop1b: number,
    },
    prop2: {
        prop2a: number,
        prop2b: number,
    }
}

type TypeB = RecursivePartial<ITypeA>;

describe("RecursivePartial", () => {
    // The following will fail to compile.
    //
    // const a: ITypeA = {
    //     prop1: {
    //         prop1a: 0
    //     }
    // };

    const b: TypeB = {
        prop1: {
            prop1a: 0
        }
    };
});
