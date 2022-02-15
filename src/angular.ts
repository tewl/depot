import { failedResult, insertIf, nodeBinForOs, succeeded, succeededResult } from ".";
import { Directory } from "./directory";
import { File } from "./file";
import { Result } from "./result";
import {isISpawnExitError, spawn, spawnErrorToString} from "./spawn2";


const angularProjectFilename = "angular.json";


export async function findAngularProjectDirs(rootDir: Directory): Promise<Array<Directory>>
{
    const contents = await rootDir.contents(true);
    const projectFiles = contents.files.filter((curFile) => curFile.fileName === angularProjectFilename);
    const projectDirs = projectFiles.map((curProjFile) => curProjFile.directory);
    return Promise.resolve(projectDirs);
}


type EslintResults = Array<IEslintFileResults>;

interface IEslintFileResults
{
    filePath: string;
    messages: Array<IEslintMessage>;
    errorCount: number;
    fatalErrorCount: number;
    warningCount: number;
    fixableErrorCount: number;
    fixableWarningCount: number;
    source: string;
    usedDeprecatedRules: Array<{ruleId: string, replacedBy: Array<string>}>
}

interface IEslintMessage
{
    ruleId: string;
    severity: number;
    message: string;
    line: number;
    column: number;
    nodeType: string;
    messageId: string;
    endLine: number;
    endColumn: number;
    fix?: {range: Array<number>, text: string}
}

const lintedFileExtensions = [".ts", ".js"];
const ngLintOutputRegex = /(?<before>^.*?)(?<json>\[.*\])(?<after>.*?$)/ms;

/**
 * Runs "ng lint" for the specified project files.
 *
 * @param projectDir - The directory containing the file to be linted
 * @param files - The files to be linted.  Any files that are not within
 * projectDir will be ignored.
 * @param fix - Whether to allow the the lint tool to automatically fix lint
 * errors.
 * @returns A Promise that always resolves with a result.  Upon successful
 * execution the result will contain an array describing the issues found.  If
 * no lint errors were found, the array will be empty.
 */
export async function lintFiles(
    projectDir: Directory,
    files: Array<File>,
    fix: boolean
): Promise<Result<EslintResults, string>>
{
    // Only lint files within the project directory.
    files = files.filter((curFile) => curFile.isWithin(projectDir, true));
    // Only lint files with appropriate extensions.
    files = files.filter((curFile) => lintedFileExtensions.some((curExt) => curExt === curFile.extName));

    if (files.length === 0)
    {
        // There are no files to lint.  Consider this a successful linting.
        return succeededResult([]);
    }

    // Convert the files so they are relative to the project directory.
    const projectRelativeFiles = files.map((curFile) => File.relative(projectDir, curFile));

    // Use the version of ng that is in the project's node_modules folder.
    const bin = nodeBinForOs(new File(projectDir, "node_modules", ".bin", "ng"));
    const args: Array<string> = [
        "lint",
        "--format", "json",
        ...insertIf(fix, "--fix")
    ];
    projectRelativeFiles.forEach((curProjRelativeFile) =>
    {
        args.push("--lint-file-patterns");
        args.push(curProjRelativeFile.toString());
    });

    const result = await spawn(bin.toString(), args, {cwd: projectDir.toString()}).closePromise;

    // Do not fail if the process returned a failure exit code.  That only
    // indicates that lint errors were found.  In that case, we should go ahead
    // and parse the output.
    if (succeeded(result))
    {
        // Linting returned an exit code of 0.  This means there were no
        // warnings or errors or they were all fixed.
        return succeededResult([]);
    }
    else
    {
        if (!isISpawnExitError(result.error))
        {
            const errMsg = spawnErrorToString(result.error);
            console.error(errMsg);
            return failedResult(errMsg);
        }
    }

    const output = result.error.stdout;
    const matches = output.match(ngLintOutputRegex);
    if (!matches)
    {
        const errMsg = `Output from "ng lint" does not match expected text.  ${output}`;
        return failedResult(errMsg);

    }

    const jsonStr = matches.groups!.json;
    let json: EslintResults;
    try
    {
        json = JSON.parse(jsonStr);
    }
    catch (error)
    {
        const errMsg = `Failed to parse "ng lint JSON output.  ${error}`;
        return failedResult(errMsg);
    }

    return succeededResult(json);
}
