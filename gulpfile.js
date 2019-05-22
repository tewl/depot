const path = require("path");
// Allow use of TS files.
require('ts-node').register({project: path.join(__dirname, "tsconfig.json")});
const fs = require("fs");
const gulp = require("gulp");
const stripJsonComments = require("strip-json-comments");
const del = require("del");
const _ = require("lodash");
const spawn = require("./src/spawn").spawn;
const Deferred = require("./src/deferred").Deferred;
const toGulpError = require("./src/gulpHelpers").toGulpError;


////////////////////////////////////////////////////////////////////////////////
// Default
////////////////////////////////////////////////////////////////////////////////

gulp.task("default", () => {
    const usage = [
        "Gulp tasks",
        "  clean  - Delete built and temporary files",
        "  tslint - Run TSLint on source files",
        "  ut     - Run unit tests",
        "  build  - Run TSLint, unit tests, and compile TypeScript"
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

    return spawn("./node_modules/.bin/tslint", tslintArgs, __dirname,
                 undefined, undefined, process.stdout, process.stderr)
    .closePromise
    .catch((err) => {
        // If we're supposed to emit an error, then go ahead and rethrow it.
        // Otherwise, just eat it.
        if (emitError) {
            throw err;
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
        throw toGulpError(err);
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
            throw toGulpError(firstError);
        }
    });

});


function compileTypeScript() {
    const ts         = require("gulp-typescript");
    const sourcemaps = require("gulp-sourcemaps");

    console.log("Compiling TypeScript...");

    // The gulp-typescript package interacts correctly with gulp if you
    // return this outer steam from your task function.  I, however, prefer
    // to use promises so that build steps can be composed in a more modular
    // fashion.
    const tsResultDfd = new Deferred();
    const jsDfd       = new Deferred();
    const dtsDfd      = new Deferred();

    const outDir = path.join(__dirname, "dist");
    let numErrors = 0;

    const tsResults = gulp.src(getSrcGlobs(false))
    .pipe(sourcemaps.init())
    .pipe(ts(getTsConfig(), ts.reporter.longReporter()))
    .on("error", () => {
        numErrors++;
    })
    .on("finish", () => {
        if (numErrors > 0) {
            tsResultDfd.reject(new Error(`TypeScript transpilation failed with ${numErrors} errors.`));
        } else {
            tsResultDfd.resolve();
        }
    });

    tsResults.js
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(outDir))
    .on("finish", () => {
        jsDfd.resolve();
    });

    tsResults.dts
    .pipe(gulp.dest(outDir))
    .on("finish", () => {
        dtsDfd.resolve();
    });

    return Promise.all([tsResultDfd.promise, jsDfd.promise, dtsDfd.promise]);
}


////////////////////////////////////////////////////////////////////////////////
// Project Management
////////////////////////////////////////////////////////////////////////////////

function getSrcGlobs(includeSpecs) {
    "use strict";

    const srcGlobs = ["src/**/*.ts"];
    if (!includeSpecs) {
        srcGlobs.push("!src/**/*.spec.ts");
    }

    return srcGlobs;
}


function getTsConfig(tscConfigOverrides) {
    "use strict";

    const tsConfigFile = path.join(__dirname, "tsconfig.json");
    const tsConfigJsonText = fs.readFileSync(tsConfigFile, "utf8");
    const compilerOptions = JSON.parse(stripJsonComments(tsConfigJsonText)).compilerOptions;

    // Apply any overrides provided by the caller.
    _.assign(compilerOptions, tscConfigOverrides);

    compilerOptions.typescript = require("typescript");
    return compilerOptions;
}
