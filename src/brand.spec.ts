import { Uuid } from ".";
import { Brand } from "./brand";


type FooId = Brand<Uuid, "FooId">;
type BarId = Brand<Uuid, "BarId">;

function fooOp(foo: FooId): void
{
}


// Since branding is a typing technique, there are no runnable unit tests. The
// following provides examples of type checks that branding (nominal typing)
// makes possible.

// const foo = Uuid.create() as FooId;
// const bar: BarId = Uuid.create() as BarId;
// fooOp(foo);         // Legal
// fooOp(bar);         // Error
