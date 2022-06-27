import { indent, splitIntoLines } from "./stringHelpers";


export type WriterFn = (str: string) => void;


/**
 * A writer that maintains a current indentation level.  Useful in situations
 * where hierarchical data is being printed.
 */
export class IndentingWriter {

    private readonly _spacesPerLevel: number;
    private readonly _writerFn: WriterFn;
    private _curLevel = 0;


    /**
     * Creates a new IndentingWriter instance
     * @param writerFn - The function used to write strings (often console.log)
     * @param spacesPerLevel - The number of space characters to use per
     * indentation.
     */
    public constructor(writerFn: WriterFn, spacesPerLevel = 4) {
        this._writerFn = writerFn;
        this._spacesPerLevel = 4;
    }


    /**
     * Gets this IndentingWriter's current indentation level
     */
    public get indentLevel(): number {
        return this._curLevel;
    }


    /**
     * Writes the specified string
     * @param str - The string to write.  Note: This string may contain newline
     * or EOL and will be indented properly.
     */
    public write(str: string): void {
        const numSpaces = this._curLevel * this._spacesPerLevel;

        splitIntoLines(str)
        .map((curLine) => indent(curLine, numSpaces))
        .forEach((curLine) => this._writerFn(curLine));
    }


    /**
     * Increases the current indentation level by one.
     */
    public indent(): void {
        this._curLevel += 1;
    }


    /**
     * Decreases the current indentation level by one.
     */
    public outdent(): void {
        this._curLevel = Math.max(0, this._curLevel - 1);
    }


    /**
     * Resets the indentation level to zero.
     */
    public reset(): void {
        this._curLevel = 0;
    }

}
