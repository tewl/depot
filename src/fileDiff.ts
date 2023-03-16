import { insertIf } from "./arrayHelpers";
import {File} from "./file";
import { getOs, OperatingSystem } from "./os";
import {spawn} from "./spawn2";


export async function showVsCodeDiff(fileA: File, fileB: File, useExisting = false, wait = true): Promise<void> {

    const cmd = getOs() === OperatingSystem.Windows ? "code.cmd" : "code";

    const args = [
        ...insertIf(!useExisting, "-n"),
        ...insertIf(wait, "--wait"),
        "-d",
        fileA.toString(),
        fileB.toString()
    ];

    const spawnOut = spawn(cmd, args);
    await spawnOut.closePromise;
    return undefined;
}
