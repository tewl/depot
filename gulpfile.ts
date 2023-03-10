import * as path from "path";
import * as _ from "lodash";
import chalk = require("chalk");
import { nodeBinForOs, createCmdLaunchScript, makeNodeScriptExecutable } from "./src/nodeUtil";
import { Directory } from "./src/directory";
import { toGulpError } from "./src/gulpHelpers";
import { File } from "./src/file";
import { getOs, OperatingSystem } from "./src/os";
import { spawn, SpawnError, spawnErrorToString } from "./src/spawn2";
import { hr } from "./src/ttyHelpers";
import * as promiseResult from "./src/promiseResult";
import { mapAsync } from "./src/promiseHelpers";
import { FailedResult, Result, SucceededResult } from "./src/result";


////////////////////////////////////////////////////////////////////////////////
// Project Configuration
////////////////////////////////////////////////////////////////////////////////

const distDir = new Directory(__dirname, "dist");
const tmpDir  = new Directory(__dirname, "tmp");

//
// The executable scripts build by this project.
// These scripts will be made executable.
//
const scripts: Array<string> = [
    // The project does not contain any executable scripts.
];

const sep = hr("-");

const successStyle = chalk.green.bold;
const failStyle    = chalk.red.bold;
const headerStyle  = chalk.bold;


////////////////////////////////////////////////////////////////////////////////
// clean
////////////////////////////////////////////////////////////////////////////////

export async function clean(): Promise<void> {
    return promiseResult.toPromise(runClean());
}


function runClean(): Promise<Result<undefined, string>> {
    const dirsToDelete = [tmpDir, distDir];
    try {
        dirsToDelete.forEach((curDir) => curDir.deleteSync());
        return Promise.resolve(new SucceededResult(undefined));
    }
    catch (error) {
        return Promise.resolve(new FailedResult(`Failed to delete files. ${JSON.stringify(error, undefined, 4)}`));
    }
}


////////////////////////////////////////////////////////////////////////////////
// eslint
////////////////////////////////////////////////////////////////////////////////

export async function eslint(): Promise<void> {
    const result = await runEslint();
    if (result.succeeded) {
        // We still need to print the eslint output, because it may contain
        // warnings (only errors cause failure).
        console.log(result.value);
        return;
    }
    else {
        console.log(spawnErrorToString(result.error));
        throw toGulpError("ESLint errors found.");
    }
}


async function runEslint(): Promise<Result<string, SpawnError>> {
    const eslintArgs = [
        ".",
        "--ext", ".js",
        "--ext", ".ts",
    ];

    let cmd = path.join(".", "node_modules", ".bin", "eslint");
    cmd = nodeBinForOs(cmd).toString();

    return spawn(cmd, eslintArgs, { cwd: __dirname })
    .closePromise;
}


////////////////////////////////////////////////////////////////////////////////
// Unit Tests
////////////////////////////////////////////////////////////////////////////////

export async function ut(): Promise<void> {
    const result = await runUnitTests(true);
    if (result.succeeded) {
        // Since we allowed output while running the unit test task, we don't
        // have to print it out again.
    }
    else {
        // Since we allowed output while running the unit test task, we don't
        // have to print it out again.
        throw toGulpError("Unit tests failed.");
    }
}


async function runUnitTests(
    allowOutput: boolean
): Promise<Result<string, SpawnError>> {
    const jasmineConfigFile = new File(".", "jasmine.json");

    // A typical command line looks something like:
    // .\node_modules\.bin\ts-node.cmd --project .\tsconfig.json .\node_modules\jasmine\bin\jasmine.js --color --config=.\jasmine.json

    const tsconfigFile = new File(".", "tsconfig.json");
    const jasmineScript = new File(".", "node_modules", "jasmine", "bin", "jasmine.js");

    const cmd = nodeBinForOs(path.join(".", "node_modules", ".bin", "ts-node")).toString();
    const args = [
        "--project", tsconfigFile.toString(),
        jasmineScript.toString(),
        "--color",
        `--config=${jasmineConfigFile.toString()}`
    ];

    return spawn(
        cmd,
        args,
        { cwd: __dirname },
        undefined,
        allowOutput ? process.stdout : undefined,
        allowOutput ? process.stderr : undefined
    )
    .closePromise;
}


////////////////////////////////////////////////////////////////////////////////
// Compile
////////////////////////////////////////////////////////////////////////////////

export async function compile(): Promise<void> {
    const tsconfigFile = new File("tsconfig.json");
    const result = await runCompile(tsconfigFile);
    if (result.succeeded) {
        console.log(result.value);
    }
    else {
        console.log(spawnErrorToString(result.error));
        throw toGulpError("TypeScript compilation failed.");
    }
}


async function runCompile(tsconfigFile: File): Promise<Result<string, SpawnError>> {
    // A typical command line looks something like:
    // _ ./node_modules/.bin/tsc --project ./tsconfig.json _
    const cmd = nodeBinForOs(path.join(".", "node_modules", ".bin", "tsc")).toString();
    const args = [
        "--project", tsconfigFile.toString(),
        "--pretty"
    ];

    return spawn(cmd, args, { cwd: __dirname })
    .closePromise;
}


////////////////////////////////////////////////////////////////////////////////
// Build
////////////////////////////////////////////////////////////////////////////////

export async function build(): Promise<void> {
    const cleanResult = await runClean();
    if (cleanResult.failed) {
        throw toGulpError(cleanResult.error);
    }

    const tsConfigFile = new File("tsconfig.json");
    const tasks = [
        {
            name:          "ESLint",
            promiseResult: runEslint()
        },
        {
            name:          "Unit tests",
            promiseResult: runUnitTests(false)
        },
        {
            name:          "TypeScript compilation",
            promiseResult: runCompile(tsConfigFile)
        }
    ];

    const results = await promiseResult.allArrayM(tasks.map((curTask) => curTask.promiseResult));

    if (results.failed) {
        console.error(failStyle(sep));
        console.error(failStyle(`❌ Task failed: ${tasks[results.error.index]!.name}`));
        console.error(failStyle(sep));
        console.error(spawnErrorToString(results.error.item));
        throw toGulpError("❌ " + failStyle("Build failed."));
    }
    else {
        const indexedResults = results.value.map(
            (curResult, index) => { return {index, result: curResult}; }
        );

        // Separate the results into those that produced output and those that did not.
        const [resultsWithOutput, resultsWithoutOutput] =
            _.partition(indexedResults, (curIndexedResult) => curIndexedResult.result);

        if (resultsWithoutOutput.length > 0) {
            const taskNames = _.map(resultsWithoutOutput, (curIndexedResult) => tasks[curIndexedResult.index]!.name);
            const header = headerStyle("Tasks with no output:");
            console.log(`${header} ${taskNames.join(", ")}`);
        }
        _.forEach(resultsWithOutput, (curIndexedResult) => {
            const header = headerStyle(`Output from ${tasks[curIndexedResult.index]!.name}`);
            console.log(header);
            console.log();
            console.log(curIndexedResult.result);

            console.log(sep);
        });

        await makeExecutable();

        console.log("✅ " + successStyle("Build succeeded."));
    }
}


/**
 * Configures the scripts this project builds so that they can be easily
 * executed.
 * @return A promise that resolves when all operations have completed.
 */
function makeExecutable(): Promise<void> {
    const scriptFiles = _.map(scripts, (curScript) => new File(distDir, curScript));

    //
    // Insert a shebang line into each script and turn on the executable
    // permission on each script file.
    //
    const makeExecutablePromises = mapAsync(scriptFiles, (curJsScriptFile) => {
        console.log(`Making executable:  ${curJsScriptFile.toString()}`);
        return makeNodeScriptExecutable(curJsScriptFile);
    });

    //
    // If running on Windows, create .cmd files that will launch the executable
    // scripts.
    //
    let createCmdPromises: Promise<void> = Promise.resolve();
    if (getOs() === OperatingSystem.Windows) {
        createCmdPromises = mapAsync(scriptFiles, (curJsScriptFile) => {
            return createCmdLaunchScript(curJsScriptFile)
            .then((cmdFile) => {
                console.log(`Created Windows cmd file:  ${cmdFile.fileName}`);
            });
        })
        .then(() => {
            // Do nothing.
        });
    }

    return Promise.all([makeExecutablePromises, createCmdPromises])
    .then(() => {
        // Do nothing.
    });
}
