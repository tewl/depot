# depot

A convenient place to grab TypeScript source code files.

## Developing

This project uses the Gulp task runner.  Even though it is installed locally,
you will also need to install the Gulp CLI globally:

```bash
$ npm install --global gulp-cli
```

It is recommended that you use `gulp build`, because it performs all operations:
cleaning, tslint, unit tests, compiling.

``` bash
$ gulp build
```
