/**
 * Provides a way to make branded types.  A brand adds a unique member to the
 * type do defeat TS's default structural typing and force the type to behave
 * more like nominal typing.
 */
export type Brand<TBaseType, TBrandLiteral> = TBaseType & { _brand: TBrandLiteral };
