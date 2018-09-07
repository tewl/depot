
// A regular expression to match valid Git repo URLs.
// match[1]: project name
const gitUrlRegexp = /.*\/(.*)\.git$/;


/**
 * Extracts the project name from a Git URL
 * @param gitUrl - The Git URL for a repository
 * @return The name of the project.  This method will throw an Error if the
 * provided URL is invalid.
 */
export function gitUrlToProjectName(gitUrl: string): string
{
    const match = gitUrl.match(gitUrlRegexp);
    if (!match)
    {
        throw new Error("Tried to get project name from invalid Git URL.");
    }

    return match[1];
}
