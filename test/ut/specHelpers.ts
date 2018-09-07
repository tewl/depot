import {Directory} from "../../src/directory";

export const sampleRepoUrl = "https://github.com/kwpeters/sampleGitRepo-src.git";
export const sampleRepoDir = new Directory(__dirname, "..", "..", "..", "..", "sampleGitRepo-src");
export const tmpDir = new Directory(__dirname, "..", "..", "tmp");
