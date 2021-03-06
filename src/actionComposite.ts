import * as _ from "lodash";
import {IAction} from "./action";


export class ActionComposite implements IAction<void>
{
    // #region Instance Data Members
    private _actions: Array<IAction<any>> = [];
    // #endregion


    public get description(): undefined | string
    {
        const descriptions = _.map(this._actions, (curAction) => curAction.description || "<action>");
        return descriptions.join("\n");
    }


    public get length(): number
    {
        return this._actions.length;
    }


    public add(...newActions: Array<IAction<any>>): ActionComposite
    {
        this._actions = _.concat(this._actions, newActions);
        return this;
    }


    public async execute(): Promise<void>
    {
        return Promise.all(_.map(this._actions, (curAction) => curAction.execute()))
        .then(() => { });
    }
}
