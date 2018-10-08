import * as path from "path";
import * as _ from "lodash";
import {tmpDir} from "../test/ut/spechelpers";
import {File} from "./file";
import {Directory} from "./directory";


describe("File", () => {


    describe("instance", () => {


        beforeEach(() => {
            tmpDir.emptySync();
        });


        describe("dirName, baseName, fileName, extName", () => {


            it("will give the correct parts of a normal file path", () => {
                const file1: File = new File("..", "tmp", "bar", "baz.txt");
                expect(file1.dirName).toEqual("../tmp/bar/");
                expect(file1.baseName).toEqual("baz");
                expect(file1.fileName).toEqual("baz.txt");
                expect(file1.extName).toEqual(".txt");
            });


            it("will give the correct parts of a file path with no directory", () => {
                const file: File = new File("baz.foo");

                expect(file.dirName).toEqual("./");
                expect(file.baseName).toEqual("baz");
                expect(file.fileName).toEqual("baz.foo");
                expect(file.extName).toEqual(".foo");
            });


            it("will give the correct parts of a file path with no extension", () => {
                const file: File = new File("../tmp/bar/baz");

                expect(file.dirName).toEqual("../tmp/bar/");
                expect(file.baseName).toEqual("baz");
                expect(file.fileName).toEqual("baz");
                expect(file.extName).toEqual("");
            });


            it("will give the correct parts for a dotfile", () => {
                const file: File = new File("../tmp/bar/.baz");

                expect(file.dirName).toEqual("../tmp/bar/");
                expect(file.baseName).toEqual(".baz");
                expect(file.fileName).toEqual(".baz");
                expect(file.extName).toEqual("");
            });


        });


        describe("directory", () => {


            it("will return a Directory object representing the directory containing the file", () => {
                const dir = new Directory("../foo/bar");
                const file = new File(dir, "baz.txt");
                expect(file.directory.toString()).toEqual(dir.toString());
            });


        });


        describe("toString()", () => {


            it("will return the string that was passed into the constructor", () => {
                const file1 = new File("./foo/bar.txt");
                expect(file1.toString()).toEqual("foo/bar.txt");
            });


        });


        describe("equals()", () => {


            it("will return true for 2 files that are equal", () => {
                const file1 = new File(__filename);
                const file2 = new File(__filename);

                expect(file1.equals(file2)).toBeTruthy();
            });


            it("will return false for 2 different files", () => {
                const file1 = new File(".", "foo.txt");
                const file2 = new File(".", "bar.txt");

                expect(file1.equals(file2)).toBeFalsy();
            });


            it("will return false for two files named the same but in different folders", () => {
                tmpDir.emptySync();

                const file1 = new File(tmpDir, "foo", "a.txt");
                const file2 = new File(tmpDir, "bar", "a.txt");

                expect(file1.equals(file2)).toBeFalsy();
            });


        });


        describe("exists()", () => {


            it("will resolve to a Stats object for an existing file", () => {
                const file = new File(__filename);
                return file.exists()
                .then((stats) => {
                    expect(stats).toBeTruthy();
                });
            });


            it("will resolve to false for a file that does not exist", () => {
                const file = new File(__dirname, "xyzzy.txt");
                return file.exists()
                .then((result) => {
                    expect(result).toBeFalsy();
                });
            });


            it("will resolve to false for a directory with the specified path", () => {
                const file = new File(__dirname);
                return file.exists()
                .then((result) => {
                    expect(result).toBeFalsy();
                });
            });


        });


        describe("existsSync()", () => {


            it("will return a truthy fs.Stats object for an existing file", () => {
                expect(new File(__filename).existsSync()).toBeTruthy();
            });


            it("will return false for a file that does not exist", () => {
                expect(new File(__dirname, "xyzzy.txt").existsSync()).toBeFalsy();
            });


            it("will return false for a directory with the specified path", () => {
                expect(new File(__dirname).existsSync()).toBeFalsy();
            });


        });


        describe("absPath()", () => {


            it("will return the absolute path of the file", () => {
                const file = new File(__filename);
                const absPath = file.absPath();
                expect(absPath[0]).toEqual("/");
                expect(_.endsWith(absPath, ".spec.ts")).toBeTruthy();
            });


        });


        describe("absolute()", () => {


            it("will return a File instance that is absolute", () => {
                const relFile = new File("../package.json");
                expect(relFile.toString()[0]).not.toEqual("/");

                const absFile = relFile.absolute();
                expect(absFile.toString()[0]).toEqual("/");
            });


        });


        describe("delete()", () => {


            it("will delete the specified file", () => {
                const fileA = new File(tmpDir, "a.txt");
                fileA.writeSync("This is file A");
                expect(fileA.existsSync()).toBeTruthy();

                return fileA.delete()
                .then(() => {
                    expect(fileA.existsSync()).toBeFalsy();
                });
            });


            it("will resolve when the specified file does not exist", (done) => {
                const fileA = new File(tmpDir, "xyzzy.txt");

                expect(fileA.existsSync()).toBeFalsy();

                return fileA.delete()
                .then(() => {
                    done();
                });
            });


        });


        describe("deleteSync()", () => {


            it("will delete the specified file", () => {
                const fileA = new File(tmpDir, "a.txt");
                fileA.writeSync("This is file A");
                expect(fileA.existsSync()).toBeTruthy();

                fileA.deleteSync();

                expect(fileA.existsSync()).toBeFalsy();
            });


            it("will just return when the specified file does not exist", () => {
                const fileA = new File(tmpDir, "xyzzy.txt");

                expect(fileA.existsSync()).toBeFalsy();
                fileA.deleteSync();
                expect(fileA.existsSync()).toBeFalsy();
            });


        });


        describe("copy()", () => {


            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will copy the file to the specified destination directory", (done) => {
                const srcFile = new File(tmpDir, "src", "file.txt");
                srcFile.writeSync("abc");

                const dstDir = new Directory(tmpDir, "dst");

                srcFile.copy(dstDir)
                .then((dstFile) => {
                    expect(dstFile.existsSync()).toBeTruthy();
                    expect(dstFile.absPath()).toEqual(path.join(dstDir.absPath(), "file.txt"));
                    expect(dstFile.readSync()).toEqual("abc");
                    done();
                });
            });


            it("will rename the file when a directory and filename is specified", (done) => {
                const srcFile = new File(tmpDir, "src", "file.txt");
                srcFile.writeSync("123");

                const dstDir = new Directory(tmpDir, "dst");

                srcFile.copy(dstDir, "dest.txt")
                .then((dstFile) => {
                    expect(dstFile.existsSync()).toBeTruthy();
                    expect(dstFile.absPath()).toEqual(path.join(dstDir.absPath(), "dest.txt"));
                    expect(dstFile.readSync()).toEqual("123");
                    done();
                });
            });


            it("will rename the file when a destination File is specified", (done) => {
                const srcFile = new File(tmpDir, "src", "file.txt");
                srcFile.writeSync("def");

                const dstFile = new File(tmpDir, "dst", "dest.txt");

                srcFile.copy(dstFile)
                .then((dstFile) => {
                    expect(dstFile.existsSync()).toBeTruthy();
                    expect(dstFile.absPath()).toEqual(path.join(tmpDir.absPath(), "dst", "dest.txt"));
                    expect(dstFile.readSync()).toEqual("def");
                    done();
                });
            });


            it("will reject if the source file does not exist", (done) => {
                const srcFile = new File(tmpDir, "src", "xyzzy.txt");
                const dstDir = new Directory(tmpDir, "dst");

                srcFile.copy(dstDir)
                .catch(() => {
                    done();
                });
            });


            it("will not create a destination directory if the source file does not exist", (done) => {
                const srcFile = new File(tmpDir, "src", "xyzzy.txt");
                const dstDir = new Directory(tmpDir, "dst");

                srcFile.copy(dstDir)
                .catch(() => {
                    expect(dstDir.existsSync()).toBeFalsy();
                    done();
                });
            });


            it("will not create a destination file if the source file does not exist", (done) => {
                const srcFile = new File(tmpDir, "src", "xyzzy.txt");
                const dstDir = new Directory(tmpDir, "dst");

                srcFile.copy(dstDir)
                .catch(() => {
                    const dstFile = new File(dstDir, "xyzzy.txt");
                    expect(dstFile.existsSync()).toBeFalsy();
                    done();
                });
            });


            it("will overwrite an existing desintation file", (done) => {
                const oldDstFile = new File(tmpDir, "dst", "dst.txt");
                oldDstFile.writeSync("old");

                const srcFile = new File(tmpDir, "src", "src.txt");
                srcFile.writeSync("new");

                srcFile.copy(oldDstFile)
                .then((newDstFile) => {
                    expect(newDstFile.existsSync()).toBeTruthy();
                    expect(newDstFile.absPath()).toEqual(oldDstFile.absPath());
                    expect(newDstFile.readSync()).toEqual("new");
                    done();
                });
            });


            it("will copy the atime and mtime from the source file", (done) => {

                const srcFile = new File(tmpDir, "src", "file.txt");
                srcFile.writeSync("abc");

                const dstFile = new File(tmpDir, "dst", "file.txt");

                // There is a maximum possible error of 1 second when
                // copying the source's timestamps to the destination.
                // To make sure the timestamps are being copied, we are
                // waiting for 2 seconds before doing the copy and then
                // making sure that the timestamp deltas are within the
                // allowable 1 second.
                setTimeout(() => {
                    srcFile.copy(dstFile)
                    .then(() => {
                        // We get the source file's stats after the copy has
                        // happened, because copying it changes its last access
                        // time (atime).
                        const srcStats = srcFile.existsSync();
                        const dstStats = dstFile.existsSync();

                        if (!srcStats || !dstStats)
                        {
                            fail();
                            return;
                        }

                        expect(dstStats.atime.valueOf() - srcStats.atime.valueOf()).toBeLessThan(1000);
                        expect(dstStats.mtime.valueOf() - srcStats.mtime.valueOf()).toBeLessThan(1000);
                        done();
                    });
                }, 2000);
            });


        });


        describe("copySync()", () => {


            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will copy the file to the specified destination directory", () => {
                const srcFile = new File(tmpDir, "src", "file.txt");
                srcFile.writeSync("abc");

                const dstDir = new Directory(tmpDir, "dst");

                const dstFile = srcFile.copySync(dstDir);

                expect(dstFile.existsSync()).toBeTruthy();
                expect(dstFile.absPath()).toEqual(path.join(dstDir.absPath(), "file.txt"));
                expect(dstFile.readSync()).toEqual("abc");
            });


            it("will rename the file when a directory and filename is specified", () => {
                const srcFile = new File(tmpDir, "src", "file.txt");
                srcFile.writeSync("123");

                const dstDir = new Directory(tmpDir, "dst");

                const dstFile = srcFile.copySync(dstDir, "dest.txt");

                expect(dstFile.existsSync()).toBeTruthy();
                expect(dstFile.absPath()).toEqual(path.join(dstDir.absPath(), "dest.txt"));
                expect(dstFile.readSync()).toEqual("123");
            });


            it("will rename the file when a destination File is specified", () => {
                const srcFile = new File(tmpDir, "src", "file.txt");
                srcFile.writeSync("def");

                let dstFile = new File(tmpDir, "dst", "dest.txt");

                dstFile = srcFile.copySync(dstFile);

                expect(dstFile.existsSync()).toBeTruthy();
                expect(dstFile.absPath()).toEqual(path.join(tmpDir.absPath(), "dst", "dest.txt"));
                expect(dstFile.readSync()).toEqual("def");
            });


            it("will throw if the source file does not exist", () => {
                const srcFile = new File(tmpDir, "src", "xyzzy.txt");
                const dstDir = new Directory(tmpDir, "dst");

                expect(() => {
                    srcFile.copySync(dstDir);
                }).toThrow();
            });


            it("will not create a destination directory if the source file does not exist", () => {
                const srcFile = new File(tmpDir, "src", "xyzzy.txt");
                const dstDir = new Directory(tmpDir, "dst");

                expect(() => { srcFile.copySync(dstDir); }).toThrow();
                expect(dstDir.existsSync()).toBeFalsy();
            });


            it("will not create a destination file if the source file does not exist", () => {
                const srcFile = new File(tmpDir, "src", "xyzzy.txt");
                const dstDir = new Directory(tmpDir, "dst");

                expect(() => { srcFile.copySync(dstDir); }).toThrow();
                const dstFile = new File(dstDir, "xyzzy.txt");
                expect(dstFile.existsSync()).toBeFalsy();
            });


            it("will overwrite an existing desintation file", () => {
                const oldDstFile = new File(tmpDir, "dst", "dst.txt");
                oldDstFile.writeSync("old");

                const srcFile = new File(tmpDir, "src", "src.txt");
                srcFile.writeSync("new");

                const newDstFile = srcFile.copySync(oldDstFile);
                expect(newDstFile.existsSync()).toBeTruthy();
                expect(newDstFile.absPath()).toEqual(oldDstFile.absPath());
                expect(newDstFile.readSync()).toEqual("new");
            });


            it("will copy the atime and mtime from the source file", (done) => {

                const srcFile = new File(tmpDir, "src", "file.txt");
                srcFile.writeSync("abc");

                const dstFile = new File(tmpDir, "dst", "file.txt");

                // There is a maximum possible error of 1 second when
                // copying the source's timestamps to the destination.
                // To make sure the timestamps are being copied, we are
                // waiting for 2 seconds before doing the copy and then
                // making sure that the timestamp deltas are within the
                // allowable 1 second.
                setTimeout(() => {
                    srcFile.copySync(dstFile);

                    // We get the source file's stats after the copy has
                    // happened, because copying it changes its last access
                    // time (atime).
                    const srcStats = srcFile.existsSync();
                    const dstStats = dstFile.existsSync();

                    if (!srcStats || !dstStats)
                    {
                        fail();
                        return;
                    }

                    expect(dstStats.atime.valueOf() - srcStats.atime.valueOf()).toBeLessThan(1000);
                    expect(dstStats.mtime.valueOf() - srcStats.mtime.valueOf()).toBeLessThan(1000);
                    done();

                }, 2000);
            });

        });


        describe("move()", () => {


            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will move the file to the specified destination directory", (done) => {
                const srcFile = new File(tmpDir, "src", "file.txt");
                srcFile.writeSync("abc");

                const dstDir = new Directory(tmpDir, "dst");

                srcFile.move(dstDir)
                .then((dstFile) => {
                    expect(srcFile.existsSync()).toBeFalsy();
                    expect(dstFile.existsSync()).toBeTruthy();
                    expect(dstFile.absPath()).toEqual(path.join(dstDir.absPath(), "file.txt"));
                    expect(dstFile.readSync()).toEqual("abc");
                    done();
                });
            });


            it("will rename the file when a directory and filename is specified", (done) => {
                const srcFile = new File(tmpDir, "src", "file.txt");
                srcFile.writeSync("123");

                const dstDir = new Directory(tmpDir, "dst");

                srcFile.move(dstDir, "dest.txt")
                .then((dstFile) => {
                    expect(srcFile.existsSync()).toBeFalsy();
                    expect(dstFile.existsSync()).toBeTruthy();
                    expect(dstFile.absPath()).toEqual(path.join(dstDir.absPath(), "dest.txt"));
                    expect(dstFile.readSync()).toEqual("123");
                    done();
                });
            });


            it("will rename the file when a destination File is specified", (done) => {
                const srcFile = new File(tmpDir, "src", "file.txt");
                srcFile.writeSync("def");

                const dstFile = new File(tmpDir, "dst", "dest.txt");

                srcFile.move(dstFile)
                .then((dstFile) => {
                    expect(srcFile.existsSync()).toBeFalsy();
                    expect(dstFile.existsSync()).toBeTruthy();
                    expect(dstFile.absPath()).toEqual(path.join(tmpDir.absPath(), "dst", "dest.txt"));
                    expect(dstFile.readSync()).toEqual("def");
                    done();
                });
            });


            it("will reject if the source file does not exist", (done) => {
                const srcFile = new File(tmpDir, "src", "xyzzy.txt");
                const dstDir = new Directory(tmpDir, "dst");

                srcFile.move(dstDir)
                .catch(() => {
                    done();
                });
            });


            it("will not create a destination directory if the soure file does not exist", (done) => {
                const srcFile = new File(tmpDir, "src", "xyzzy.txt");
                const dstDir = new Directory(tmpDir, "dst");

                srcFile.move(dstDir)
                .catch(() => {
                    expect(dstDir.existsSync()).toBeFalsy();
                    done();
                });
            });


            it("will not create a destination file if the source file does not exist", (done) => {
                const srcFile = new File(tmpDir, "src", "xyzzy.txt");
                const dstDir = new Directory(tmpDir, "dst");

                srcFile.move(dstDir)
                .catch(() => {
                    const dstFile = new File(dstDir, "xyzzy.txt");
                    expect(dstFile.existsSync()).toBeFalsy();
                    done();
                });
            });


            it("will overwrite an existing destination file", (done) => {
                const oldDstFile = new File(tmpDir, "dst", "dst.txt");
                oldDstFile.writeSync("old");

                const srcFile = new File(tmpDir, "src", "src.txt");
                srcFile.writeSync("new");

                srcFile.move(oldDstFile)
                .then((newDstFile) => {
                    expect(srcFile.existsSync()).toBeFalsy();
                    expect(newDstFile.existsSync()).toBeTruthy();
                    expect(newDstFile.absPath()).toEqual(oldDstFile.absPath());
                    expect(newDstFile.readSync()).toEqual("new");
                    done();
                });
            });


            it("will copy the atime and mtime from the source file", (done) => {
                const srcFile = new File(tmpDir, "src", "file.txt");
                srcFile.writeSync("abc");

                const dstFile = new File(tmpDir, "dst", "file.txt");

                // There is a maximum possible error of 1 second when
                // copying the source's timestamps to the destination.
                // To make sure the timestamps are being copied, we are
                // waiting for 2 seconds before doing the copy and then
                // making sure that the timestamp deltas are within the
                // allowable 1 second.
                setTimeout(() => {
                    // We need to get the source file's timestamps now, because
                    // after the move the source file will no longer exist.
                    const srcStats = srcFile.existsSync();

                    srcFile.move(dstFile)
                    .then(() => {

                        const dstStats = dstFile.existsSync();

                        if (!srcStats || !dstStats)
                        {
                            fail();
                            return;
                        }

                        // The destination file will have a last access time
                        // (atime) close to now, because it was copied from the
                        // source file and the source file's atime was updated
                        // during the copy operation.  Because the destination
                        // file's atime could be up to 1 second before the
                        // source file's, we will allow for a little over 1
                        // second.
                        expect(Date.now() - dstStats.atime.valueOf()).toBeLessThan(1100);
                        expect(dstStats.mtime.valueOf() - srcStats.mtime.valueOf()).toBeLessThan(1000);
                        done();
                    });
                }, 2000);
            });
        });


        describe("moveSync()", () => {


            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will move the file to the specified destination directory", () => {
                const srcFile = new File(tmpDir, "src", "file.txt");
                srcFile.writeSync("abc");

                const dstDir = new Directory(tmpDir, "dst");

                const dstFile = srcFile.moveSync(dstDir);

                expect(srcFile.existsSync()).toBeFalsy();
                expect(dstFile.existsSync()).toBeTruthy();
                expect(dstFile.absPath()).toEqual(path.join(dstDir.absPath(), "file.txt"));
                expect(dstFile.readSync()).toEqual("abc");
            });


            it("will rename the file when a directory and filename is specified", () => {
                const srcFile = new File(tmpDir, "src", "file.txt");
                srcFile.writeSync("123");

                const dstDir = new Directory(tmpDir, "dst");

                const dstFile = srcFile.moveSync(dstDir, "dest.txt");

                expect(srcFile.existsSync()).toBeFalsy();
                expect(dstFile.existsSync()).toBeTruthy();
                expect(dstFile.absPath()).toEqual(path.join(dstDir.absPath(), "dest.txt"));
                expect(dstFile.readSync()).toEqual("123");
            });


            it("will rename the file when a destination File is specified", () => {
                const srcFile = new File(tmpDir, "src", "file.txt");
                srcFile.writeSync("def");

                let dstFile = new File(tmpDir, "dst", "dest.txt");

                dstFile = srcFile.moveSync(dstFile);

                expect(srcFile.existsSync()).toBeFalsy();
                expect(dstFile.existsSync()).toBeTruthy();
                expect(dstFile.absPath()).toEqual(path.join(tmpDir.absPath(), "dst", "dest.txt"));
                expect(dstFile.readSync()).toEqual("def");
            });


            it("will throw if the source file does not exist", () => {
                const srcFile = new File(tmpDir, "src", "xyzzy.txt");
                const dstDir = new Directory(tmpDir, "dst");

                expect(() => {
                    srcFile.moveSync(dstDir);
                }).toThrow();
            });


            it("will not create a destination directory if the source file does not exist", () => {
                const srcFile = new File(tmpDir, "src", "xyzzy.txt");
                const dstDir = new Directory(tmpDir, "dst");

                expect(() => { srcFile.moveSync(dstDir); }).toThrow();
                expect(dstDir.existsSync()).toBeFalsy();
            });


            it("will not create a destination file if the source file does not exist", () => {
                const srcFile = new File(tmpDir, "src", "xyzzy.txt");
                const dstDir = new Directory(tmpDir, "dst");

                expect(() => { srcFile.moveSync(dstDir); }).toThrow();
                const dstFile = new File(dstDir, "xyzzy.txt");
                expect(dstFile.existsSync()).toBeFalsy();
            });


            it("will overwrite an existing desintation file", () => {
                const oldDstFile = new File(tmpDir, "dst", "dst.txt");
                oldDstFile.writeSync("old");

                const srcFile = new File(tmpDir, "src", "src.txt");
                srcFile.writeSync("new");

                const newDstFile = srcFile.moveSync(oldDstFile);
                expect(srcFile.existsSync()).toBeFalsy();
                expect(newDstFile.existsSync()).toBeTruthy();
                expect(newDstFile.absPath()).toEqual(oldDstFile.absPath());
                expect(newDstFile.readSync()).toEqual("new");
            });


            it("will copy the atime and mtime from the source file", (done) => {

                const srcFile = new File(tmpDir, "src", "file.txt");
                srcFile.writeSync("abc");

                const dstFile = new File(tmpDir, "dst", "file.txt");

                // There is a maximum possible error of 1 second when
                // copying the source's timestamps to the destination.
                // To make sure the timestamps are being copied, we are
                // waiting for 2 seconds before doing the copy and then
                // making sure that the timestamp deltas are within the
                // allowable 1 second.
                setTimeout(() => {
                    // We need to get the source file's timestamps now, because
                    // after the move the source file will no longer exist.
                    const srcStats = srcFile.existsSync();

                    srcFile.moveSync(dstFile);

                    const dstStats = dstFile.existsSync();

                    if (!srcStats || !dstStats)
                    {
                        fail();
                        return;
                    }

                    // The destination file will have a last access time
                    // (atime) close to now, because it was copied from the
                    // source file and the source file's atime was updated
                    // during the copy operation.  Because the destination
                    // file's atime could be up to 1 second before the
                    // source file's, we will allow for a little over 1
                    // second.
                    expect(Date.now() - dstStats.atime.valueOf()).toBeLessThan(1100);
                    expect(dstStats.mtime.valueOf() - srcStats.mtime.valueOf()).toBeLessThan(1000);
                    done();

                }, 2000);
            });

        });


        describe("write()", () => {


            it("creates the necessary directories", (done) => {
                const dir = new Directory(tmpDir, "foo", "bar");
                const file = new File(dir, "file.txt");

                file.write("hello world")
                .then(() => {
                    expect(dir.existsSync()).toBeTruthy();
                    expect(file.existsSync()).toBeTruthy();
                    done();
                });

            });


            it("writes the specified text to the file", (done) => {
                const dir = new Directory(tmpDir, "foo", "bar");
                const file = new File(dir, "file.txt");

                file.write("hello world")
                .then(() => {
                    return file.read();
                })
                .then((text: string) => {
                    expect(text).toEqual("hello world");
                    done();
                });
            });
        });


        describe("writeSync()", () => {


            it("creates the necessary directories", () => {
                const dir = new Directory(tmpDir, "foo", "bar");
                const file = new File(dir, "file.txt");

                file.writeSync("hello world");
                expect(dir.existsSync()).toBeTruthy();
                expect(file.existsSync()).toBeTruthy();
            });


            it("writes the specified text to the file", () => {
                const dir = new Directory(tmpDir, "foo", "bar");
                const file = new File(dir, "file.txt");

                file.writeSync("hello world");

                expect(file.readSync()).toEqual("hello world");
            });


        });


        describe("writeJson()", () => {


            it("creates the necessary directories", (done) => {
                const dir = new Directory(tmpDir, "foo", "bar");
                const file = new File(dir, "file.json");

                file.writeJson({foo: "bar"})
                .then(() => {
                    expect(dir.existsSync()).toBeTruthy();
                    expect(file.existsSync()).toBeTruthy();
                    done();
                });
            });


            it("writes the specified JSON to the file", (done) => {
                const dir = new Directory(tmpDir, "foo", "bar");
                const file = new File(dir, "file.json");

                file.writeJson({foo: "bar"})
                .then(() => {
                    return file.readJson<any>();
                })
                .then((data) => {
                    expect(data.foo).toEqual("bar");
                    done();
                });
            });

        });


        describe("writeJsonSync()", () => {


            it("creates the necessary directories", () => {
                const dir = new Directory(tmpDir, "foo", "bar");
                const file = new File(dir, "file.txt");

                file.writeJsonSync({foo: "bar"});
                expect(dir.existsSync()).toBeTruthy();
                expect(file.existsSync()).toBeTruthy();
            });


            it("writes the specified JSON to the file", () => {
                const dir = new Directory(tmpDir, "foo", "bar");
                const file = new File(dir, "file.txt");

                file.writeJsonSync({foo: "bar"});

                expect(file.readJsonSync<any>().foo).toEqual("bar");
            });


        });


        describe("getHash()", () => {


            it("calculates the expected hash value", (done) => {
                const file = new File(tmpDir, "src", "file.txt");
                file.writeSync("abc");

                file.getHash()
                .then((hash) => {
                    expect(hash).toEqual("900150983cd24fb0d6963f7d28e17f72");
                    done();
                });
            });


        });


        describe("read()", () => {


            it("can read the contents of a file", (done) => {
                const dir = new Directory(tmpDir, "foo", "bar");
                const file = new File(dir, "file.txt");
                file.writeSync("12345");

                file.read()
                .then((text) => {
                    expect(text).toEqual("12345");
                    done();
                });
            });


            it("will reject if the file being read does not exist", (done) => {
                const file = new File(tmpDir, "xyzzy.txt");

                file.read()
                .catch(() => {
                    done();
                });
            });


        });


        describe("readSync()", () => {


            it("can read the contents of a file", () => {
                const dir = new Directory(tmpDir, "foo", "bar");
                const file = new File(dir, "file.txt");
                file.writeSync("12345");

                expect(file.readSync()).toEqual("12345");
            });


            it("will throw if the file being read does not exist", () => {
                const file = new File(tmpDir, "xyzzy.txt");
                expect(() => {
                    file.readSync();
                }).toThrow();
            });
        });


        describe("readJson()", () => {


            it("can read the contents of a file", (done) => {
                const dir = new Directory(tmpDir, "foo", "bar");
                const file = new File(dir, "file.txt");
                file.writeSync(JSON.stringify({foo: "bar"}));

                file.readJson<{foo: string}>()
                .then((data) => {
                    expect(data.foo).toEqual("bar");
                    done();
                });
            });


            it("will reject if the file being read does not exist", (done) => {
                const file = new File(tmpDir, "xyzzy.txt");

                file.readJson()
                .catch(() => {
                    done();
                });
            });


            describe("readJsonSync()", () => {


                it("can read the contents of a file", () => {
                    const dir = new Directory(tmpDir, "foo", "bar");
                    const file = new File(dir, "file.txt");
                    file.writeSync(JSON.stringify({foo: "bar"}));

                    expect(file.readJsonSync<{foo: string}>().foo).toEqual("bar");
                });


                it("will throw if the file being read does not exist", () => {
                    const file = new File(tmpDir, "xyzzy.txt");
                    expect(() => {
                        file.readJsonSync();
                    }).toThrow();
                });
            });


        });


    });

});
