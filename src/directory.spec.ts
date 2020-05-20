import {tmpDir} from "../test/ut/spechelpers";
import * as path from "path";
import {File} from "./file";
import {Directory, IDirectoryContents} from "./directory";
import * as _ from "lodash";
import {getOs, OperatingSystem} from "./os";


describe("Directory", () => {


    describe("static", () => {


        describe("relative()", () => {


            it("will return a Directory representing the path from `from` to `to`", async () => {

                const dirA = new Directory(tmpDir, "dirA");
                const dirB = new Directory(tmpDir, "dirB");
                const dirC = new Directory(dirB, "dirC");

                expect(Directory.relative(dirA, dirB).toString()).toEqual(path.join("..", "dirB"));
                expect(Directory.relative(dirA, dirC).toString()).toEqual(path.join("..", "dirB", "dirC"));
                expect(Directory.relative(dirB, dirA).toString()).toEqual(path.join("..", "dirA"));
                expect(Directory.relative(dirB, dirC).toString()).toEqual("dirC");
                expect(Directory.relative(dirC, dirA).toString()).toEqual(path.join("..", "..", "dirA"));
                expect(Directory.relative(dirC, dirB).toString()).toEqual("..");
            });


        });


        describe("relativeParts()", () => {


            it("returns the expected array of path parts", () => {

                const dirA = new Directory("dirA");
                const dirB = new Directory(dirA, "b", "c");
                expect(Directory.relativeParts(dirA, dirB)).toEqual(["b", "c"]);
            });


        });


    });


    describe("instance", () => {


        describe("dirName", () => {


            it("will return the name of this directory without preceding path", () => {
                const dir = new Directory(tmpDir, "foo");
                expect(dir.dirName).toEqual("foo");
            });


            it("will return / for the name of the filesystem root", () => {
                const root = new Directory("/");
                expect(root.dirName).toEqual("/");
            });

        });


        describe("toString", () => {


            it("will return the string that was passed into the constructor", () => {
                const dir1 = new Directory("./foo/bar");
                expect(dir1.toString()).toEqual(path.join("foo", "bar"));
            });


        });


        describe("equals()", () => {


            it("will return true for 2 directories that are equal", () => {
                const dir1 = new Directory(__dirname);
                const dir2 = new Directory(__dirname);

                expect(dir1.equals(dir2)).toBeTruthy();
            });


            it("will return false for 2 different directories", () => {
                const dir1 = new Directory(__dirname);
                const dir2 = new Directory(__dirname, "..");

                expect(dir1.equals(dir2)).toBeFalsy();
            });


            it("will return false for two directories named the same but in different folders", () => {
                tmpDir.emptySync();

                const dir1 = new Directory(tmpDir, "foo", "dir");
                const dir2 = new Directory(tmpDir, "bar", "dir");

                expect(dir1.equals(dir2)).toBeFalsy();
            });


        });


        describe("absPath()", () => {


            it("return a string containing the absolute path", () => {
                const absPath = tmpDir.absPath();
                if (getOs() === OperatingSystem.WINDOWS) {
                    expect(_.startsWith(absPath, "C:\\")).toBeTruthy();
                    expect(_.endsWith(absPath, "\\tmp")).toBeTruthy();
                }
                else {
                    expect(absPath[0]).toEqual("/");
                    expect(_.endsWith(absPath, "/tmp")).toBeTruthy();
                }
            });


        });


        describe("absolute()", () => {


            it("returns an absolute path version of the source", () => {
                const absTmp = tmpDir.absolute();
                const path = absTmp.toString();

                expect(tmpDir.toString()[0]).not.toEqual("/");

                if (getOs() === OperatingSystem.WINDOWS) {
                    expect(_.startsWith(path, "C:\\")).toBeTruthy();
                    expect(_.endsWith(path, "\\tmp")).toBeTruthy();
                }
                else {
                    expect(path[0]).toEqual("/");
                    expect(_.endsWith(path, "/tmp")).toBeTruthy();
                }
            });


        });


        describe("exists()", () => {


            it("will resolve to a truthy fs.Stats object for an existing directory", () => {
                const dir = new Directory(__dirname);
                return dir.exists()
                .then((stats) => {
                    expect(stats).toBeTruthy();
                });
            });


            it("will resolve to false for a directory that does not exist", () => {
                const dir = new Directory(__dirname, "xyzzy");
                return dir.exists()
                .then((stats) => {
                    expect(stats).toBeFalsy();
                });
            });


            it("will resolve to false for a file with the specified path", () => {
                const dir = new Directory(__filename);
                return dir.exists()
                .then((stats) => {
                    expect(stats).toBeFalsy();
                });
            });

        });


        describe("existsSync()", () => {


            it("will return a truthy fs.Stats object for an existing directory", () => {
                const dir = new Directory(__dirname);
                expect(dir.existsSync()).toBeTruthy();
            });


            it("will return false for a directory that does not exist", () => {
                const dir = new Directory(__dirname, "xyzzy");
                expect(dir.existsSync()).toBeFalsy();
            });


            it("will return false for a file with the specified path", () => {
                const dir = new Directory(__filename);
                expect(dir.existsSync()).toBeFalsy();
            });


        });


        describe("isEmpty()", () => {

            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will return false when a directory contains a file", () => {

                new File(tmpDir, "foo.txt").writeSync("This is foo.txt");

                return tmpDir.isEmpty()
                .then((isEmpty: boolean) => {
                    expect(isEmpty).toBeFalsy();
                });
            });


            it("will return false when a directory contains a subdirectory", () => {

                const fooDir = new Directory(tmpDir, "foo");

                fooDir.ensureExistsSync();

                return tmpDir.isEmpty()
                .then((isEmpty: boolean) => {
                    expect(isEmpty).toBeFalsy();
                });
            });


            it("will return true when a directory is empty", () => {
                return tmpDir.isEmpty()
                .then((isEmpty: boolean) => {
                    expect(isEmpty).toBeTruthy();
                });
            });
        });


        describe("isEmptySync()", () => {


            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will return false when a directory contains a file", () => {

                const file = new File(tmpDir, "foo.txt");
                file.writeSync("This is foo.txt");
                expect(tmpDir.isEmptySync()).toBeFalsy();
            });


            it("will return false when a directory contains a subdirectory", () => {
                const fooDir = new Directory(tmpDir, "foo");

                fooDir.ensureExistsSync();

                expect(tmpDir.isEmptySync()).toBeFalsy();
            });


            it("will return true when a directory is empty", () => {
                expect(tmpDir.isEmptySync()).toBeTruthy();
            });


        });


        describe("ensureExists()", () => {


            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will make sure all necessary directories exist when given an absolute path", () => {
                const dirPath = path.join(tmpDir.absPath(), "dir1", "dir2", "dir3");
                const dir = new Directory(dirPath);

                return dir.ensureExists()
                .then(() => {
                    expect(new Directory(dirPath).existsSync()).toBeTruthy();
                });
            });


            it("will make sure all necessary directories exist when given a relative path", () => {
                const dirPath = path.join("tmp", "dir1", "dir2", "dir3");
                const dir = new Directory(dirPath);

                return dir.ensureExists()
                .then(() => {
                    expect(new Directory(dirPath).existsSync()).toBeTruthy();
                });
            });


            it("will resolve with the Directory instance", (done) => {
                const dir = new Directory(tmpDir, "foo");
                dir.ensureExists()
                .then((resultDir) => {
                    expect(resultDir.absPath()).toEqual(dir.absPath());
                    done();
                });
            });


        });


        describe("ensureExistsSync()", () => {


            it("will make sure all necessary directories exist when given an absolute path", () => {
                const dirPath = path.join(tmpDir.absPath(), "dir1", "dir2", "dir3");
                const dir = new Directory(dirPath);
                dir.ensureExistsSync();
                expect(new Directory(dirPath).existsSync()).toBeTruthy();
            });


            it("will make sure all necessary directories exist when given a relative path", () => {
                const dirPath = path.join("tmp", "dir1", "dir2", "dir3");
                const dir = new Directory(dirPath);
                dir.ensureExistsSync();
                expect(new Directory(dirPath).existsSync()).toBeTruthy();
            });


            it("will return the Directory instance", () => {
                const dir = new Directory(tmpDir, "foo");
                const dirResult = dir.ensureExistsSync();
                expect(dirResult.absPath()).toEqual(dir.absPath());
            });


        });


        describe("empty()", () => {


            it("if the directory does not exist, will create all needed directories", () => {

                const dir = new Directory(tmpDir, "dir1", "dir2", "dir3");

                return dir.empty()
                .then(() => {
                    expect(dir.existsSync()).toBeTruthy();
                });
            });


            it("will remove files from the specified directory", () => {

                const fileA = new File(tmpDir, "a.txt");
                const fileB = new File(tmpDir, "b.txt");
                const fileC = new File(tmpDir, "c.txt");

                fileA.writeSync("This is file A");
                fileB.writeSync("This is file B");
                fileC.writeSync("This if file C");

                return tmpDir.empty()
                .then(() => {
                    expect(tmpDir.existsSync()).toBeTruthy();
                    expect(fileA.existsSync()).toBeFalsy();
                    expect(fileB.existsSync()).toBeFalsy();
                    expect(fileC.existsSync()).toBeFalsy();
                });
            });


            it("resolves with the Directory instance", (done) => {
                const dir = new Directory(tmpDir, "foo");
                dir.ensureExistsSync();
                dir.empty()
                .then((resultDir) => {
                    expect(resultDir.absPath()).toEqual(dir.absPath());
                    done();
                });
            });


        });


        describe("emptySync()", () => {


            it("if the specified directory does not exist, will create all needed directories", () => {
                const dir = new Directory(tmpDir, "dir1", "dir2", "dir3");
                dir.emptySync();
                expect(dir.existsSync()).toBeTruthy();
            });


            it("will remove files from the specified directory", () => {

                const fileA = new File(tmpDir, "a.txt");
                const fileB = new File(tmpDir, "b.txt");
                const fileC = new File(tmpDir, "c.txt");

                fileA.writeSync("This is file A");
                fileB.writeSync("This is file B");
                fileC.writeSync("This is file C");

                tmpDir.emptySync();

                expect(tmpDir.existsSync()).toBeTruthy();
                expect(fileA.existsSync()).toBeFalsy();
                expect(fileB.existsSync()).toBeFalsy();
                expect(fileC.existsSync()).toBeFalsy();
            });


            it("returns the Directory instance", () => {
                const dir = new Directory(tmpDir, "foo");
                dir.ensureExistsSync();
                const resultDir = dir.emptySync();
                expect(resultDir.absPath()).toEqual(dir.absPath());
            });

        });


        describe("delete()", () => {


            it("will completely remove the directory and its contents", () => {

                const testDir = new Directory(tmpDir, "test");
                const testFile = new File(testDir, "file.txt");
                const testSubdir = new Directory(testDir, "subdir");

                testDir.ensureExistsSync();
                testFile.writeSync("A test file");
                testSubdir.ensureExistsSync();

                return testDir.delete()
                .then(() => {
                    expect(testDir.existsSync()).toBeFalsy();
                    expect(testFile.existsSync()).toBeFalsy();
                    expect(testSubdir.existsSync()).toBeFalsy();
                });
            });


            it("will resolve when the specified directory does not exist", (done) => {
                const dir = new Directory(tmpDir, "xyzzy");
                dir.delete()
                .then(() => {
                    done();
                });

            });


        });


        describe("deleteSync()", () => {


            it("will completely remove the directory and its contents", () => {

                const testDir = new Directory(tmpDir, "test");
                const testFile = new File(testDir, "file.txt");
                const testSubdir = new Directory(testDir, "subdir");

                testDir.ensureExistsSync();
                testFile.writeSync("A test file");
                testSubdir.ensureExistsSync();

                testDir.deleteSync();
                expect(testDir.existsSync()).toBeFalsy();
                expect(testFile.existsSync()).toBeFalsy();
                expect(testSubdir.existsSync()).toBeFalsy();
            });


            it("will not throw when the specified directory does not exist", () => {
                const dir = new Directory(tmpDir, "xyzzy");

                expect(() => {
                    dir.deleteSync();
                }).not.toThrow();
            });


        });


        describe("contents()", () => {


            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will read the files and subdirectories within a directory", (done) => {

                const dirA = new Directory(tmpDir, "dirA");
                const fileA = new File(dirA, "a.txt");

                const dirB = new Directory(tmpDir, "dirB");
                const fileB = new File(dirB, "b.txt");

                const fileC = new File(tmpDir, "c.txt");

                dirA.ensureExistsSync();
                dirB.ensureExistsSync();

                fileA.writeSync("File A");
                fileB.writeSync("File B");
                fileC.writeSync("File C");

                tmpDir.contents()
                .then((result: IDirectoryContents) => {
                    expect(result.subdirs.length).toEqual(2);

                    // Put the subdirectories in a deterministic order.
                    const subdirs = _.sortBy(result.subdirs, (curSubdir) => curSubdir.absPath());
                    expect(subdirs[0].toString()).toEqual(path.join("tmp", "dirA"));
                    expect(subdirs[1].toString()).toEqual(path.join("tmp", "dirB"));

                    expect(result.files.length).toEqual(1);
                    expect(result.files[0].toString()).toEqual(path.join("tmp", "c.txt"));
                    done();
                });
            });


            it("will include dotfiles and dot folders", (done) => {

                const dotFile = new File(tmpDir, ".dotfile");
                const dotFolder = new Directory(tmpDir, ".dotfolder");

                dotFile.writeSync("foo");
                dotFolder.ensureExistsSync();

                tmpDir.contents()
                .then((contents: IDirectoryContents) => {
                    expect(contents.files.length).toEqual(1);
                    expect(contents.files[0].toString()).toEqual(path.join("tmp", ".dotfile"));
                    expect(contents.subdirs.length).toEqual(1);
                    expect(contents.subdirs[0].toString()).toEqual(path.join("tmp", ".dotfolder"));
                    done();
                });
            });


            it("will read files and subdirectories recursively", (done) => {

                const dirA = new Directory(tmpDir, "dirA");
                const dirA2 = new Directory(dirA, "dirA2");
                const fileA = new File(dirA, "a.txt");

                const dirB = new Directory(tmpDir, "dirB");
                const fileB = new File(dirB, "b.txt");

                const fileC = new File(tmpDir, "c.txt");

                dirA.ensureExistsSync();
                dirA2.ensureExistsSync();
                dirB.ensureExistsSync();

                fileA.writeSync("File A");
                fileB.writeSync("File B");
                fileC.writeSync("File C");

                tmpDir.contents(true)
                .then((result: IDirectoryContents) => {
                    expect(result.subdirs.length).toEqual(3);

                    // Put the subdirectories in a deterministic order.
                    const subdirs = _.sortBy(result.subdirs, (curSubdir) => curSubdir.absPath());
                    expect(subdirs[0].toString()).toEqual(path.join("tmp", "dirA"));
                    expect(subdirs[1].toString()).toEqual(path.join("tmp", "dirA", "dirA2"));
                    expect(subdirs[2].toString()).toEqual(path.join("tmp", "dirB"));

                    expect(result.files.length).toEqual(3);
                    // Put the files in a deterministic order.
                    const files = _.sortBy(result.files, (curFile) => curFile.absPath());
                    expect(files[0].toString()).toEqual(path.join("tmp", "c.txt"));
                    expect(files[1].toString()).toEqual(path.join("tmp", "dirA", "a.txt"));
                    expect(files[2].toString()).toEqual(path.join("tmp", "dirB", "b.txt"));
                    done();
                });
            });


            it("rejects when the directory does not exist", (done) => {
                const dirA = new Directory(tmpDir, "dirA");  // Does not exist.

                dirA.contents()
                .then(() => {
                    fail("The above call to contents() should have rejected.");
                })
                .catch((err) => {
                    done();
                });
            });


        });


        describe("contentsSync()", () => {


            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will read the files and subdirectories within a directory", () => {

                const dirA = new Directory(tmpDir, "dirA");
                const fileA = new File(dirA, "a.txt");

                const dirB = new Directory(tmpDir, "dirB");
                const fileB = new File(dirB, "b.txt");

                const fileC = new File(tmpDir, "c.txt");

                dirA.ensureExistsSync();
                dirB.ensureExistsSync();

                fileA.writeSync("File A");
                fileB.writeSync("File B");
                fileC.writeSync("File C");

                const contents = tmpDir.contentsSync();

                expect(contents.subdirs.length).toEqual(2);
                expect(contents.subdirs[0].toString()).toEqual(path.join("tmp", "dirA"));
                expect(contents.subdirs[1].toString()).toEqual(path.join("tmp", "dirB"));
                expect(contents.files.length).toEqual(1);
                expect(contents.files[0].toString()).toEqual(path.join("tmp", "c.txt"));
            });


            it("will include dotfiles and dot folders", () => {

                const dotFile = new File(tmpDir, ".dotfile");
                const dotFolder = new Directory(tmpDir, ".dotfolder");

                dotFile.writeSync("foo");
                dotFolder.ensureExistsSync();

                const contents = tmpDir.contentsSync();

                expect(contents.files.length).toEqual(1);
                expect(contents.files[0].toString()).toEqual(path.join("tmp", ".dotfile"));
                expect(contents.subdirs.length).toEqual(1);
                expect(contents.subdirs[0].toString()).toEqual(path.join("tmp", ".dotfolder"));
            });


            it("will read files and subdirectories recursively", () => {

                const dirA = new Directory(tmpDir, "dirA");
                const dirA2 = new Directory(dirA, "dirA2");
                const fileA = new File(dirA, "a.txt");

                const dirB = new Directory(tmpDir, "dirB");
                const fileB = new File(dirB, "b.txt");

                const fileC = new File(tmpDir, "c.txt");

                dirA.ensureExistsSync();
                dirA2.ensureExistsSync();
                dirB.ensureExistsSync();

                fileA.writeSync("File A");
                fileB.writeSync("File B");
                fileC.writeSync("File C");

                const result = tmpDir.contentsSync(true);
                expect(result.subdirs.length).toEqual(3);

                // Put the subdirectories in a deterministic order.
                const subdirs = _.sortBy(result.subdirs, (curSubdir) => curSubdir.absPath());
                expect(subdirs[0].toString()).toEqual(path.join("tmp", "dirA"));
                expect(subdirs[1].toString()).toEqual(path.join("tmp", "dirA", "dirA2"));
                expect(subdirs[2].toString()).toEqual(path.join("tmp", "dirB"));

                expect(result.files.length).toEqual(3);
                // Put the files in a deterministic order.
                const files = _.sortBy(result.files, (curFile) => curFile.absPath());
                expect(files[0].toString()).toEqual(path.join("tmp", "c.txt"));
                expect(files[1].toString()).toEqual(path.join("tmp", "dirA", "a.txt"));
                expect(files[2].toString()).toEqual(path.join("tmp", "dirB", "b.txt"));

            });


        });


        describe("prune()", () => {


            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will recursively remove all subdirectories", () => {

                new Directory(tmpDir, "dirA", "dirBa", "dirC").ensureExistsSync();
                new Directory(tmpDir, "dirA", "dirBb", "dirE").ensureExistsSync();
                new Directory(tmpDir, "dir1", "dir2a", "dir3").ensureExistsSync();
                new Directory(tmpDir, "dir1", "dir2b", "dir4").ensureExistsSync();

                return tmpDir.prune()
                .then(() => {
                    expect(tmpDir.isEmptySync()).toBeTruthy();
                });
            });


            it("will not prune directories containing files", () => {

                new Directory(tmpDir, "dirA", "dirBa", "dirC").ensureExistsSync();
                new Directory(tmpDir, "dirA", "dirBb", "dirE").ensureExistsSync();
                new Directory(tmpDir, "dir1", "dir2a", "dir3").ensureExistsSync();
                new Directory(tmpDir, "dir1", "dir2b", "dir4").ensureExistsSync();
                const file = new File(tmpDir, "dirA", "foo.txt");
                file.writeSync("This is foo.txt");

                return tmpDir.prune()
                .then(() => {
                    expect(tmpDir.isEmptySync()).toBeFalsy();

                    const contents = tmpDir.contentsSync();
                    expect(contents.subdirs.length).toEqual(1);
                    expect(contents.subdirs[0].absPath()).toEqual(path.join(tmpDir.absPath(), "dirA"));
                    expect(contents.files.length).toEqual(0);

                    expect(new Directory(tmpDir, "dirA", "dirBa").existsSync()).toBeFalsy();
                    expect(new Directory(tmpDir, "dirA", "dirBb").existsSync()).toBeFalsy();
                    expect(file.existsSync()).toBeTruthy();
                });
            });


        });


        describe("pruneSync()", () => {


            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will recursiveely remove all subdirectories", () => {

                new Directory(tmpDir, "dirA", "dirBa", "dirC").ensureExistsSync();
                new Directory(tmpDir, "dirA", "dirBb", "dirE").ensureExistsSync();
                new Directory(tmpDir, "dir1", "dir2a", "dir3").ensureExistsSync();
                new Directory(tmpDir, "dir1", "dir2b", "dir4").ensureExistsSync();

                tmpDir.pruneSync();

                expect(tmpDir.isEmptySync()).toBeTruthy();
            });


            it("will not prune directories containing files", () => {

                new Directory(tmpDir, "dirA", "dirBa", "dirC").ensureExistsSync();
                new Directory(tmpDir, "dirA", "dirBb", "dirE").ensureExistsSync();
                new Directory(tmpDir, "dir1", "dir2a", "dir3").ensureExistsSync();
                new Directory(tmpDir, "dir1", "dir2b", "dir4").ensureExistsSync();
                const file = new File(tmpDir, "dirA", "foo.txt");
                file.writeSync("This is foo.txt");

                tmpDir.pruneSync();

                expect(tmpDir.isEmptySync()).toBeFalsy();

                const contents = tmpDir.contentsSync();

                expect(contents.subdirs.length).toEqual(1);
                expect(contents.subdirs[0].absPath()).toEqual(path.join(tmpDir.absPath(), "dirA"));
                expect(contents.files.length).toEqual(0);

                expect(new Directory(tmpDir, "dirA", "dirBa").existsSync()).toBeFalsy();
                expect(new Directory(tmpDir, "dirA", "dirBb").existsSync()).toBeFalsy();
                expect(file.existsSync()).toBeTruthy();
            });


        });


        describe("copy()", () => {


            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will copy a directory structure to the destination (copyRoot=true)", (done) => {
                // src
                //   dirA
                //     a.txt
                //     dirB
                //       b.txt
                //     dirC
                // dest

                // With copyRoot=true the src directory and all of its contents
                // should be copied under dest.

                const srcDir = new Directory(tmpDir, "src");

                const dirA = new Directory(srcDir, "dirA");
                dirA.ensureExistsSync();

                const fileA = new File(dirA, "a.txt");
                fileA.writeSync("file a");

                const dirB = new Directory(dirA, "dirB");
                dirB.ensureExistsSync();

                const fileB = new File(dirB, "b.txt");
                fileB.writeSync("file b");

                const dirC = new Directory(dirA, "dirC");
                dirC.ensureExistsSync();

                const destDir = new Directory(tmpDir, "dest");
                destDir.ensureExistsSync();

                srcDir.copy(destDir, true)
                .then((counterpartDestDir) => {
                    // Should resolve with the counterpart of the source folder.
                    expect(counterpartDestDir.toString()).toEqual(path.join("tmp", "dest", "src"));

                    expect(new Directory(destDir, "src", "dirA").existsSync()).toBeTruthy();
                    expect(new File(     destDir, "src", "dirA", "a.txt").existsSync()).toBeTruthy();
                    expect(new Directory(destDir, "src", "dirA", "dirB").existsSync()).toBeTruthy();
                    expect(new File(     destDir, "src", "dirA", "dirB", "b.txt").existsSync()).toBeTruthy();
                    expect(new Directory(destDir, "src", "dirA", "dirC").existsSync()).toBeTruthy();
                    done();
                });
            });


            it("will copy a directory structure to the destination (copyRoot=false)", (done) => {
                // src
                //   dirA
                //     a.txt
                //     dirB
                //       b.txt
                //     dirC
                // dest

                // With copyRoot=false src's contents (not src itself) should be
                // copied under dest.

                const srcDir = new Directory(tmpDir, "src");

                const dirA = new Directory(srcDir, "dirA");
                dirA.ensureExistsSync();

                const fileA = new File(dirA, "a.txt");
                fileA.writeSync("file a");

                const dirB = new Directory(dirA, "dirB");
                dirB.ensureExistsSync();

                const fileB = new File(dirB, "b.txt");
                fileB.writeSync("file b");

                const dirC = new Directory(dirA, "dirC");
                dirC.ensureExistsSync();

                const destDir = new Directory(tmpDir, "dest");
                destDir.ensureExistsSync();

                srcDir.copy(destDir, false)
                .then((counterpartDestDir) => {
                    // Should resolve with the counterpart of the source folder.
                    expect(counterpartDestDir.toString()).toEqual(path.join("tmp", "dest"));

                    expect(new Directory(destDir, "dirA").existsSync()).toBeTruthy();
                    expect(new File(     destDir, "dirA", "a.txt").existsSync()).toBeTruthy();
                    expect(new Directory(destDir, "dirA", "dirB").existsSync()).toBeTruthy();
                    expect(new File(     destDir, "dirA", "dirB", "b.txt").existsSync()).toBeTruthy();
                    expect(new Directory(destDir, "dirA", "dirC").existsSync()).toBeTruthy();
                    done();
                });
            });


        });


        describe("copySync()", () => {


            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will copy a directory structure to the destination (copyRoot=true)", () => {
                // src
                //   dirA
                //     a.txt
                //     dirB
                //       b.txt
                //     dirC
                // dest

                // With copyRoot=true the src directory and all of its contents
                // should be copied under dest.

                const srcDir = new Directory(tmpDir, "src");

                const dirA = new Directory(srcDir, "dirA");
                dirA.ensureExistsSync();

                const fileA = new File(dirA, "a.txt");
                fileA.writeSync("file a");

                const dirB = new Directory(dirA, "dirB");
                dirB.ensureExistsSync();

                const fileB = new File(dirB, "b.txt");
                fileB.writeSync("file b");

                const dirC = new Directory(dirA, "dirC");
                dirC.ensureExistsSync();

                const destDir = new Directory(tmpDir, "dest");
                destDir.ensureExistsSync();

                const counterpartDestDir = srcDir.copySync(destDir, true);
                expect(counterpartDestDir.toString()).toEqual(path.join("tmp", "dest", "src"));
                expect(new Directory(destDir, "src", "dirA").existsSync()).toBeTruthy();
                expect(new File(     destDir, "src", "dirA", "a.txt").existsSync()).toBeTruthy();
                expect(new Directory(destDir, "src", "dirA", "dirB").existsSync()).toBeTruthy();
                expect(new File(     destDir, "src", "dirA", "dirB", "b.txt").existsSync()).toBeTruthy();
                expect(new Directory(destDir, "src", "dirA", "dirC").existsSync()).toBeTruthy();
            });


            it("will copy a directory structure to the destination (copyRoot=false)", () => {
                // src
                //   dirA
                //     a.txt
                //     dirB
                //       b.txt
                //     dirC
                // dest

                // With copyRoot=false src's contents (not src itself) should be
                // copied under dest.

                const srcDir = new Directory(tmpDir, "src");

                const dirA = new Directory(srcDir, "dirA");
                dirA.ensureExistsSync();

                const fileA = new File(dirA, "a.txt");
                fileA.writeSync("file a");

                const dirB = new Directory(dirA, "dirB");
                dirB.ensureExistsSync();

                const fileB = new File(dirB, "b.txt");
                fileB.writeSync("file b");

                const dirC = new Directory(dirA, "dirC");
                dirC.ensureExistsSync();

                const destDir = new Directory(tmpDir, "dest");
                destDir.ensureExistsSync();

                const counterpartDestDir = srcDir.copySync(destDir, false);
                expect(counterpartDestDir.toString()).toEqual(path.join("tmp", "dest"));
                expect(new Directory(destDir, "dirA").existsSync()).toBeTruthy();
                expect(new File(     destDir, "dirA", "a.txt").existsSync()).toBeTruthy();
                expect(new Directory(destDir, "dirA", "dirB").existsSync()).toBeTruthy();
                expect(new File(     destDir, "dirA", "dirB", "b.txt").existsSync()).toBeTruthy();
                expect(new Directory(destDir, "dirA", "dirC").existsSync()).toBeTruthy();
            });


        });


        describe("move()", () => {


            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will create destDir when it does not exist", (done) => {
                const srcDir = new Directory(tmpDir, "src");
                srcDir.ensureExistsSync();
                const fileA = new File(srcDir, "a.txt");
                fileA.writeSync("test");

                // dstDir does not exist.
                const dstDir = new Directory(tmpDir, "dst");
                expect(dstDir.existsSync()).toBeFalsy();

                srcDir.move(dstDir, true)
                .then(() => {
                    expect(dstDir.existsSync()).toBeTruthy();
                    done();
                });
            });


            it("will move this directory itself when moveRoot is true", (done) => {
                const srcDir = new Directory(tmpDir, "src");
                srcDir.ensureExistsSync();
                const fileA = new File(srcDir, "a.txt");
                fileA.writeSync("test");
                const dstDir = new Directory(tmpDir, "dst");

                srcDir.move(dstDir, true)
                .then((newDir) => {
                    // The destination directory should have been created.
                    expect(dstDir.existsSync()).toBeTruthy();
                    // The src directory should have been moved.
                    expect(new Directory(dstDir, "src").existsSync).toBeTruthy();
                    expect(srcDir.existsSync()).toBeFalsy();
                    // The file should have been moved.
                    const dstFile = new File(dstDir, "src", "a.txt");
                    expect(dstFile.existsSync()).toBeTruthy();
                    expect(dstFile.readSync()).toEqual("test");
                    // The promise should have been resolved with a directory
                    // representing the new location.
                    expect(newDir.toString()).toEqual(path.join("tmp", "dst", "src"));
                    done();
                });
            });


            it("will move only contents when moveRoot is false", (done) => {
                const srcDir = new Directory(tmpDir, "src");
                srcDir.ensureExistsSync();
                const fileA = new File(srcDir, "a.txt");
                fileA.writeSync("test");
                const dstDir = new Directory(tmpDir, "dst");

                srcDir.move(dstDir, false)
                .then((newDir) => {
                    // The destination directory should have been created.
                    expect(dstDir.existsSync()).toBeTruthy();
                    // The src directory should have been deleted.
                    expect(srcDir.existsSync()).toBeFalsy();
                    // The file should have been moved.
                    const dstFile = new File(dstDir, "a.txt");
                    expect(dstFile.existsSync()).toBeTruthy();
                    expect(dstFile.readSync()).toEqual("test");
                    // The promise should have been resolved with a directory
                    // representing the new location.
                    expect(newDir.toString()).toEqual(path.join("tmp", "dst"));
                    done();
                });
            });


            it("will move subdirectories", (done) => {

                // src
                //   dirA
                //     dirB
                //       file.txt
                // dest

                const srcDir = new Directory(tmpDir, "src");
                const srcFile = new File(srcDir, "dirA", "dirB", "file.txt");
                srcFile.writeSync("test");

                const destDir = new Directory(tmpDir, "dest");
                srcDir.move(destDir, false)
                .then((newDir) => {
                    expect(newDir.toString()).toEqual(path.join("tmp", "dest"));
                    const destFile = new File(destDir, "dirA", "dirB", "file.txt");
                    expect(destFile.existsSync).toBeTruthy();
                    expect(destFile.readSync()).toEqual("test");
                    // src should no longer exist.
                    expect(srcDir.existsSync()).toBeFalsy();
                    done();
                });

            });


        });


        describe("walk()", () => {

            beforeEach(() => {
                tmpDir.emptySync();

                // Create the following directory structure under tmpDir.
                // tmp
                // ├── dirA
                // │   ├── dirAA
                // │   │   ├── aa1.txt
                // │   │   └── aa2.txt
                // │   └── dirAB
                // │       ├── ab1.txt
                // │       └── ab2.txt
                // ├── dirB
                // │   ├── b1.txt
                // │   └── b2.txt
                // ├── root1.txt
                // └── root2.txt

                // Create the directories.
                const dirA  = new Directory(tmpDir, "dirA").ensureExistsSync();
                const dirAA = new Directory(dirA, "dirAA").ensureExistsSync();
                const dirAB = new Directory(dirA, "dirAB").ensureExistsSync();
                const dirB  = new Directory(tmpDir, "dirB").ensureExistsSync();

                // Create the files.
                const root1 = new File(tmpDir, "root1.txt");
                root1.writeSync("root1");
                const root2 = new File(tmpDir, "root2.txt");
                root2.writeSync("root2");
                const aa1 = new File(dirAA, "aa1.txt");
                aa1.writeSync("aa1");
                const aa2 = new File(dirAA, "aa2.txt");
                aa2.writeSync("aa2");
                const ab1 = new File(dirAB, "ab1.txt");
                ab1.writeSync("ab1");
                const ab2 = new File(dirAB, "ab2.txt");
                ab2.writeSync("ab2");
                const b1 = new File(dirB, "b1.txt");
                b1.writeSync("b1");
                const b2 = new File(dirB, "b2.txt");
                b2.writeSync("b2");
            });


            it("will invoke the specified callback for every file and directory", async () => {
                const encountered: Array<string> = [];

                const handler = (item: Directory | File) => {
                    encountered.push(item.toString());
                    return true;   // Always recurse into directories
                };

                await tmpDir.walk(handler);

                expect(encountered.length).toEqual(12);
                expect(encountered).toContain(path.join("tmp", "dirA"));
                expect(encountered).toContain(path.join("tmp", "dirA", "dirAA"));
                expect(encountered).toContain(path.join("tmp", "dirA", "dirAA", "aa1.txt"));
                expect(encountered).toContain(path.join("tmp", "dirA", "dirAA", "aa2.txt"));
                expect(encountered).toContain(path.join("tmp", "dirA", "dirAB"));
                expect(encountered).toContain(path.join("tmp", "dirA", "dirAB", "ab1.txt"));
                expect(encountered).toContain(path.join("tmp", "dirA", "dirAB", "ab2.txt"));
                expect(encountered).toContain(path.join("tmp", "dirB"));
                expect(encountered).toContain(path.join("tmp", "dirB", "b1.txt"));
                expect(encountered).toContain(path.join("tmp", "dirB", "b2.txt"));
                expect(encountered).toContain(path.join("tmp", "root1.txt"));
                expect(encountered).toContain(path.join("tmp", "root2.txt"));
            });


            it("will not recurse into a directory when `false` is returned", async () => {
                const encountered: Array<string> = [];

                const handler = (item: Directory | File) => {
                    encountered.push(item.toString());
                    // Do not recurse into dirAA.
                    return !/dirAA$/.test(item.toString());
                };

                await tmpDir.walk(handler);

                expect(encountered.length).toEqual(10);
                expect(encountered).toContain(path.join("tmp", "dirA"));
                expect(encountered).toContain(path.join("tmp", "dirA", "dirAA"));
                // dirAA's files will be skipped.
                expect(encountered).toContain(path.join("tmp", "dirA", "dirAB"));
                expect(encountered).toContain(path.join("tmp", "dirA", "dirAB", "ab1.txt"));
                expect(encountered).toContain(path.join("tmp", "dirA", "dirAB", "ab2.txt"));
                expect(encountered).toContain(path.join("tmp", "dirB"));
                expect(encountered).toContain(path.join("tmp", "dirB", "b1.txt"));
                expect(encountered).toContain(path.join("tmp", "dirB", "b2.txt"));
                expect(encountered).toContain(path.join("tmp", "root1.txt"));
                expect(encountered).toContain(path.join("tmp", "root2.txt"));
            });


        });


    });


});
