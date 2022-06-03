/**
 * Gets a regular expression capable of extracting the character data from CDATA
 * text.
 *
 * @return A regular expression capable of extracting the character data using
 * the "charData" named group.
 */
export function getCdataRegex(): RegExp {
    const regex = /<!\[CDATA\[(?<charData>.*)\]\]>/gms;
    return regex;
}


/**
 * Gets the text from a CDATA (character data) string.
 *
 * @param input - The CDATA text
 * @return A string containing the embedded character data.  undefined if the
 *     input text was not valid CDATA text.
 */
export function getCdata(input: string): string | undefined {
    const cdataRegex = getCdataRegex();
    const matches = cdataRegex.exec(input);
    return matches ? matches.groups!.charData : undefined;
}
