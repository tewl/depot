export type actionFunc<TResolve> = () => (TResolve | Promise<TResolve>);


/**
 * Represents an action paired with a description.
 */
export interface IAction<TResolve>
{
    /**
     * The action's textual description.
     */
    readonly description: undefined | string;

    /**
     * Executes this action
     */
    execute(): Promise<TResolve>;
}


export class Action<TResolve> implements IAction<TResolve>
{
    // #region Instance Data Members
    private readonly _theFunc:     actionFunc<TResolve>;
    private readonly _description: undefined | string;
    // #endregion


    public constructor(func: actionFunc<TResolve>, description?: string)
    {
        this._theFunc = func;
        this._description = description;
    }



    public get description(): undefined | string
    {
        return this._description;
    }


    public async execute(): Promise<TResolve>
    {
        return Promise.resolve(this._theFunc());
    }
}
