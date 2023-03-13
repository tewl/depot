import { tmpDir } from "../test/ut/specHelpers";
import { compareDirectories, FilePairingX, FilePairingXY, FilePairingY } from "./compareDirectories";
import { Directory } from "./directory";
import { File } from "./file";


describe("compareDirectories()", () => {

    // Make the paths absolute to make sure that they are converted to relative
    // paths when their contents are being compared.

    // dirX (dirX)
    //     dirA (dirXA)
    //         file1.txt (fileXA1)
    // dirY (dirY)
    //     dirA (dirYA)
    //         file1.txt (fileYA1)

    const dirX = new Directory(tmpDir, "dirX").absolute();
    const dirXA = new Directory(dirX, "dirA");
    const fileXA1 = new File(dirXA, "file1.txt");

    const dirY = new Directory(tmpDir, "dirY").absolute();
    const dirYA = new Directory(dirY, "dirA");
    const fileYA1 = new File(dirYA, "file1.txt");

    beforeEach(() => {
        tmpDir.emptySync();

        dirX.ensureExistsSync();
        dirXA.ensureExistsSync();
        fileXA1.writeSync("file1");
        dirY.ensureExistsSync();
        dirYA.ensureExistsSync();
        fileYA1.writeSync("file1");
    });


    it("can find files that are common", async () => {
        const pairings = await compareDirectories(dirX, dirY);
        const common = pairings.filter((p): p is FilePairingXY => p instanceof FilePairingXY);

        expect(common.length).toEqual(1);
        expect(common[0].xFingerprint.file.fileName).toEqual("file1.txt");
    });


    it("can find files that are unique to X", async () => {
        const fileXA2 = new File(dirXA, "file2.txt");
        fileXA2.writeSync("file2");

        const pairings = await compareDirectories(dirX, dirY);
        const uniqueToX = pairings.filter((p): p is FilePairingX => p instanceof FilePairingX);

        expect(uniqueToX.length).toEqual(1);
        expect(uniqueToX[0].xFingerprint.file.fileName).toEqual("file2.txt");
    });


    it("can find files that are unique to Y", async () => {
        const fileYA2 = new File(dirYA, "file2.txt");
        fileYA2.writeSync("file2");


        const pairings = await compareDirectories(dirX, dirY);
        const uniqueToY = pairings.filter((p): p is FilePairingY => p instanceof FilePairingY);

        expect(uniqueToY.length).toEqual(1);
        expect(uniqueToY[0].yFingerprint.file.fileName).toEqual("file2.txt");
    });

});
