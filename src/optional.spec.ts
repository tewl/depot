import {Optional} from "./optional";


class Person
{
    public static create(first: string, last: string): Optional<Person>
    {
        return undefined;
    }


    private readonly _first: string;
    private readonly _last: string;


    private constructor(first: string, last: string)
    {
        this._first = first;
        this._last = last;
    }


    public get firstName(): string
    {
        return this._first;
    }

}


function anOperation(): void
{
    const result = Person.create("Fred", "Smith");
    // const first = result.firstName;   // Error: result is possibly undefined
}
