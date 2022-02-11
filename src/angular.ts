import { Directory } from "./directory";

const angularProjectFilename = "angular.json";


export async function findAngularProjectDirs(rootDir: Directory): Promise<Array<Directory>>
{
    const contents = await rootDir.contents(true);
    const projectFiles = contents.files.filter((curFile) => curFile.fileName === angularProjectFilename);
    const projectDirs = projectFiles.map((curProjFile) => curProjFile.directory);
    return Promise.resolve(projectDirs);
}
