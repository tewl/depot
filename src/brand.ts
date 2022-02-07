/**
 * Provides a way to make branded types based on primitive types.  A brand adds
 * a unique member to the type do defeat TS's default structural typing and
 * force the type to behave more like nominal typing.
 *
 * Using an intersection in this manner works well for branding primitive types
 * (built-in types and object literals).  Since the resulting intersection is
 * only a type, it cannot be used as a value.  This makes branded classes a
 * little awkward to use.  When creating branded class instances, the underlying
 * base type must be used and it must be casted to the branded type.  For
 * example, if we have the following branded class type:
 * type FooId = Brand<Uuid, "FooId">;
 * in order to create an instance, you would have to write:
 * const foo = Uuid.create() as FooId;
 */
export type Brand<TBaseType, TBrandLiteral> = TBaseType & { _brand: TBrandLiteral};
