const path = require("path");
// Allow use of TS files.
require('ts-node').register({project: path.join(__dirname, "tsconfig.json")});
const fs = require("fs");
const gulp = require("gulp");
const del = require("del");
const _ = require("lodash");
const spawn = require("./src/spawn").spawn;
const Deferred = require("./src/deferred").Deferred;
const toGulpError = require("./src/gulpHelpers").toGulpError;
const nodeBinForOs = require("./src/nodeUtil").nodeBinForOs;

////////////////////////////////////////////////////////////////////////////////
// Default
////////////////////////////////////////////////////////////////////////////////

gulp.task("default", () => {
    const usage = [
        "Gulp tasks",
        "  clean   - Delete built and temporary files",
        "  tslint  - Run TSLint on source files",
        "  ut      - Run unit tests",
        "  build   - Run TSLint, unit tests, and compile TypeScript",
        "  compile - Compile TS files"
    ];
    console.log(usage.join("\n"));
});


////////////////////////////////////////////////////////////////////////////////
// Clean
////////////////////////////////////////////////////////////////////////////////

gulp.task("clean", () => {
    return clean();
});


function clean() {
    return del([
        "tmp/**",
        "dist/**"
    ]);
}


////////////////////////////////////////////////////////////////////////////////
// TSLint
////////////////////////////////////////////////////////////////////////////////

gulp.task("tslint", function ()
{
    "use strict";
    return runTslint(true);
});


function runTslint(emitError)
{
    console.log("Running TSLint...");

    "use strict";
    let tslintArgs = [
        "--project", "./tsconfig.json",
        "--format", "stylish"
    ];

    // Add the globs defining source files to the list of arguments.
    tslintArgs = tslintArgs.concat(getSrcGlobs(true));

    let cmd = path.join(".", "node_modules", ".bin", "tslint");
    cmd = nodeBinForOs(cmd).toString();
    return spawn(cmd, tslintArgs, {cwd: __dirname},
                 undefined, process.stdout, process.stderr)
    .closePromise
    .then((stdout) => {
        console.log(stdout);
    })
    .catch((err) => {
        console.error(err.stdout);
        console.error(err.stderr);

        // If we're supposed to emit an error, then go ahead and rethrow it.
        // Otherwise, just eat it.
        if (emitError) {
            throw toGulpError(err, "One or more TSLint errors found.");
        }
    });
}


////////////////////////////////////////////////////////////////////////////////
// Unit Tests
////////////////////////////////////////////////////////////////////////////////

gulp.task("ut", () => {
    return runUnitTests();
});


function runUnitTests() {
    const Jasmine = require("jasmine");
    const runJasmine = require("./src/jasmineHelpers").runJasmine;

    console.log("Running unit tests...");

    const jasmine = new Jasmine({});
    jasmine.loadConfig(
        {
            "spec_dir": "src",
            "spec_files": [
                "**/*.spec.ts"
            ],
            "helpers": [
            ],
            "stopSpecOnExpectationFailure": false,
            "random": false
        }
    );

    return runJasmine(jasmine)
    .catch((err) => {
        throw toGulpError(err, "One or more unit test failures.");
    });
}


////////////////////////////////////////////////////////////////////////////////
// Build
////////////////////////////////////////////////////////////////////////////////

gulp.task("build", () => {

    let firstError;

    return clean()
    .then(() => {
        return runTslint(true);
    })
    .catch((err) => {
        firstError = firstError || err;
    })
    .then(() => {
        return runUnitTests();
    })
    .catch((err) => {
        firstError = firstError || err;
    })
    .then(() => {
        return compileTypeScript();
    })
    .catch((err) => {
        firstError = firstError || err;
    })
    .then(() => {
        if (firstError) {
            throw toGulpError(firstError, "One or more build tasks failed.");
        }
    });

});


////////////////////////////////////////////////////////////////////////////////
// Compile
////////////////////////////////////////////////////////////////////////////////

/**
 * This Gulp task compiles **all** TS files (src and bin).
 */
gulp.task("compile", () => {
    "use strict";
    const sourceGlobs = getSrcGlobs(true);

    return clean()
    .then(() => {
        // Do not build if there are TSLint errors.
        return runTslint(true, sourceGlobs);
    })
    .then(() => {
        // Everything seems ok.  Go ahead and compile.
        return compileTypeScript();
    });
});


////////////////////////////////////////////////////////////////////////////////
// Helper Functions
////////////////////////////////////////////////////////////////////////////////

/**
 * Compiles TypeScript sources.
 * @return {Promise<void>} A promise that is resolved or rejected when
 * transpilation finishes.
 */
function compileTypeScript() {
    console.log("Compiling TypeScript...");

    const cmd = nodeBinForOs(path.join(".", "node_modules", ".bin", "tsc")).toString();
    const args = [
        "--project", path.join(".", "tsconfig_release.json"),
        "--pretty"
    ];

    // ./node_modules/.bin/tsc --project ./tsconfig_release.json
    return spawn(cmd, args, { cwd: __dirname})
    .closePromise
    .catch((err) => {
        console.error(_.trim(err.stdout + err.stderr));
        throw toGulpError(new Error("TypeScript compilation failed."));
    });
}


////////////////////////////////////////////////////////////////////////////////
// Project Management
////////////////////////////////////////////////////////////////////////////////

/**
 * Gets globbing patterns for the the toad library source files.  This does not
 * include the scripts.  For that see getBinGlobs().
 * @param includeSpecs - Whether to include unit test *.spec.ts files.
 * @return {Array<string>} An array of string globbing patterns
 */
function getSrcGlobs(includeSpecs) {
    "use strict";

    const srcGlobs = ["src/**/*.ts"];
    if (!includeSpecs) {
        srcGlobs.push("!src/**/*.spec.ts");
    }

    return srcGlobs;
}
