import {tmpDir} from "../test/ut/spechelpers";
import * as path from "path";
import {File} from "../src/file";
import {Directory, IDirectoryContents} from "../src/directory";


describe("Directory", () => {


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
                expect(dir1.toString()).toEqual("foo/bar");
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
                    expect(result.files.length).toEqual(1);
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
                expect(contents.files.length).toEqual(1);
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
                .then(() => {
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
                .then(() => {
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

                srcDir.copySync(destDir, true);
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

                srcDir.copySync(destDir, false);
                expect(new Directory(destDir, "dirA").existsSync()).toBeTruthy();
                expect(new File(     destDir, "dirA", "a.txt").existsSync()).toBeTruthy();
                expect(new Directory(destDir, "dirA", "dirB").existsSync()).toBeTruthy();
                expect(new File(     destDir, "dirA", "dirB", "b.txt").existsSync()).toBeTruthy();
                expect(new Directory(destDir, "dirA", "dirC").existsSync()).toBeTruthy();
            });


        });

    });


});
