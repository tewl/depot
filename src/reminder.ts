import * as _ from "lodash";


export class Duration
{
    public static days(numDays: number): Duration
    {
        return new Duration(1000 * 60 * 60 * 24 * numDays);
    }


    private readonly _durationMs: number;


    private constructor(durationMs: number)
    {
        this. _durationMs = durationMs;
    }


    public get ms(): number
    {
        return this._durationMs;
    }
}


export function add(start: Date, duration: Duration): Date
{
    const sumMs = start.valueOf() + duration.ms;
    const sumDate = new Date(sumMs);
    return sumDate;
}



type ResolvedOccurrence = SkippedOccurrence | CompletedOccurrence;


export class SkippedOccurrence
{
    private readonly _targetCompletion: Date;
    private readonly _resolvedOn: Date;
    private readonly _description: string;
    private readonly _notes: string;


    /**
     * Creates a SkippedOccurrence
     * @param targetCompletion - The target date for this occurrence.
     * @param resolvedOn - The date you want to consider this occurrence
     *   skipped.  This will normally be the same as `targetCompletion`, because
     *   if the occurrence is being skipped why not resolve it on the actual
     *   completion date, right?  It can be different, however, if you want
     *   IntervalRelative to push out future occurrences.
     * @param description - A short description of the skipped occurrence.
     * @param notes - Notes about the skipped occurrence.
     */
    public constructor(targetCompletion: Date, resolvedOn: Date, description: string, notes: string)
    {
        this._targetCompletion = targetCompletion;
        this._resolvedOn       = resolvedOn;
        this._description      = description;
        this._notes            = notes;
    }


    public get targetCompletion(): Date
    {
        return this._targetCompletion;
    }


    public get resolvedOn(): Date
    {
        return this._resolvedOn;
    }


    public get description(): string
    {
        return this._description;
    }


    public get notes(): string
    {
        return this._notes;
    }
}


export class CompletedOccurrence
{
    private readonly _targetCompletion: Date;
    private readonly _actualCompletion: Date;
    private readonly _description: string;
    private readonly _notes: string;


    /**
     *
     * @param targetCompletion - The target date for this occurrence.
     * @param actualCompletion - The date this occurrence was completed.
     * @param description - A short description of the skipped occurrence.
     * @param notes - Notes about the skipped occurrence.
     * @return description
     */
    public constructor(
        targetCompletion: Date,
        actualCompletion: Date,
        description: string,
        notes: string
    )
    {
        this._targetCompletion = targetCompletion;
        this._actualCompletion = actualCompletion;
        this._description      = description;
        this._notes            = notes;
    }


    public get targetCompletion(): Date
    {
        return this._targetCompletion;
    }


    public get actualCompletion(): Date
    {
        return this._actualCompletion;
    }


    public get description(): string
    {
        return this._description;
    }


    public get notes(): string
    {
        return this._notes;
    }
}

// TODO: Use start and end dates when getting past and future occurrences.

// TODO: Make intervals take and end date, number of occurrences, or undefined
//   (to go on forever).

/**
 * Abstract base class for all interval occurrence classes.
 */
abstract class IntervalBase
{
    protected readonly _firstOccurrence: Date;
    protected readonly _period: Duration;
    protected          _resolvedOccurrences: Array<ResolvedOccurrence>;


    protected constructor(firstOccurrence: Date, period: Duration)
    {
        this._firstOccurrence     = firstOccurrence;
        this._period              = period;
        this._resolvedOccurrences = [];
    }


    /**
     * Gets an array of past occurrences.
     * @return The past occurrences.
     */
    public getResolvedOccurrences(): Array<ResolvedOccurrence>
    {
        // Return a copy of the array so clients cannot modify the original.
        return _.clone(this._resolvedOccurrences);
    }


    public abstract getFutureOccurrences(numFutureOccurrences: number): Array<Date>;


    public addOccurrence(occurrence: ResolvedOccurrence): void
    {
        // Add the new occurrence to the array of occurrences.
        this._resolvedOccurrences.push(occurrence);

        // Because we may have added a (very) old occurrence, we need to sort
        // the array of occurrences.
        this._resolvedOccurrences = _.sortBy(
            this._resolvedOccurrences,
            [
                (curOccurrence: ResolvedOccurrence): number => {
                    if (curOccurrence instanceof SkippedOccurrence) {
                        return curOccurrence.resolvedOn.valueOf();
                    }
                    else if (curOccurrence instanceof CompletedOccurrence) {
                        return curOccurrence.actualCompletion.valueOf();
                    }
                    else {
                        throw new Error("Unknown occurrence type.");
                    }
                }
            ]
        );
    }

}


/**
 * An interval in which the next occurrence is based on the most recent
 * occurrence's target date.  Future occurrences will not slide forward when
 * the preceding occurrence is done late.
 */
export class IntervalAbsolute extends IntervalBase
{

    public constructor(firstOccurrence: Date, period: Duration)
    {
        super(firstOccurrence, period);
    }


    public getFutureOccurrences(numFutureOccurrences: number): Array<Date>
    {
        numFutureOccurrences = _.toInteger(numFutureOccurrences);

        if (numFutureOccurrences <= 0) {
            return [];
        }

        let nextFutureOccurrenceMs: number;
        const mostRecentOccurrence = _.last(this._resolvedOccurrences);
        if (mostRecentOccurrence === undefined) {
            // There are no past occurrences, so start with the first one.
            nextFutureOccurrenceMs = this._firstOccurrence.valueOf();
        }
        else {
            // Since this is an *absolute* interval, the next occurrence should
            // be relative to the *target* of the most recent occurrence.
            nextFutureOccurrenceMs = mostRecentOccurrence.targetCompletion.valueOf() + this._period.ms;
        }

        const futureOccurrences: Array<Date> = [new Date(nextFutureOccurrenceMs)];
        let numFutureOccurrencesFound = 1;
        while (numFutureOccurrencesFound < numFutureOccurrences) {
            nextFutureOccurrenceMs = nextFutureOccurrenceMs + this._period.ms;
            futureOccurrences.push(new Date(nextFutureOccurrenceMs));
            numFutureOccurrencesFound += 1;
        }

        return futureOccurrences;
    }

}


/**
 * An interval in which the next occurrence is based on the most recent
 * occurrence's actual completion date.  Future occurrences will slide forward
 * when the preceding occurrence is done late.
 */
export class IntervalRelative extends IntervalBase
{
    public constructor(firstOccurrence: Date, period: Duration)
    {
        super(firstOccurrence, period);
    }


    public getFutureOccurrences(numFutureOccurrences: number): Array<Date>
    {
        numFutureOccurrences = _.toInteger(numFutureOccurrences);

        if (numFutureOccurrences <= 0) {
            return [];
        }

        let nextFutureOccurrenceMs: number;
        const mostRecentOccurrence = _.last(this._resolvedOccurrences);
        if (mostRecentOccurrence === undefined) {
            // There are no past occurrences, so start with the first one.
            nextFutureOccurrenceMs = this._firstOccurrence.valueOf();
        }
        else {
            // Since this is an *relative* interval, the next occurrence should
            // be relative to the *actual completion* of the most recent
            // occurrence.
            const previousCompletion: Date = mostRecentOccurrence instanceof CompletedOccurrence ?
                                             mostRecentOccurrence.actualCompletion :
                                             mostRecentOccurrence.resolvedOn;

            nextFutureOccurrenceMs = previousCompletion.valueOf() + this._period.ms;
        }

        const futureOccurrences: Array<Date> = [new Date(nextFutureOccurrenceMs)];
        let numFutureOccurrencesFound = 1;
        while (numFutureOccurrencesFound < numFutureOccurrences) {
            nextFutureOccurrenceMs = nextFutureOccurrenceMs + this._period.ms;
            futureOccurrences.push(new Date(nextFutureOccurrenceMs));
            numFutureOccurrencesFound += 1;
        }

        return futureOccurrences;
    }
}
