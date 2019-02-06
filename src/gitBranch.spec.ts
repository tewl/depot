import {GitBranch} from "./gitBranch";
import {GitRepo} from "./gitRepo";
import {Directory} from "./directory";
import {sampleRepoDir, tmpDir} from "../test/ut/specHelpers";


describe("GitBranch", () => {


    describe("static", () => {


        describe("isValidBranchName()", () => {


            it("will return false when any path component starts with a '.'", async () => {
                const illegalBranchName = "this/.is_illegal";
                expect(await GitBranch.isValidBranchName(illegalBranchName)).toBeFalsy();
            });


            it("will return false when the branch name contains '..'", async () => {
                const illegalBranchName = "this.._is_illegal";
                expect(await GitBranch.isValidBranchName(illegalBranchName)).toBeFalsy();
            });


            it("will return false when the branch name ends with '/'", async () => {
                const illegalBranchName = "this_is_illegal/";
                expect(await GitBranch.isValidBranchName(illegalBranchName)).toBeFalsy();
            });


            it("will return false when the branch name ends with '.lock'", async () => {
                const illegalBranchName = "this_is_illegal.lock";
                expect(await GitBranch.isValidBranchName(illegalBranchName)).toBeFalsy();
            });


            it("will return false when the branch name contains a '~'", async () => {
                const illegalBranchName = "this~_is_illegal";
                expect(await GitBranch.isValidBranchName(illegalBranchName)).toBeFalsy();
            });


            it("will return false when the branch name contains a '^'", async () => {
                const illegalBranchName = "this^_is_illegal";
                expect(await GitBranch.isValidBranchName(illegalBranchName)).toBeFalsy();
            });


            it("will return false when the branch name contains a ':'", async () => {
                const illegalBranchName = "this:_is_illegal";
                expect(await GitBranch.isValidBranchName(illegalBranchName)).toBeFalsy();
            });


            it("will return false when the branch name contains a space", async () => {
                const illegalBranchName = "spaces are_illegal";
                expect(await GitBranch.isValidBranchName(illegalBranchName)).toBeFalsy();
            });


            it("will return false when the branch name contains a '\\'", async () => {
                const illegalBranchName = "backslashes\\_are_illegal";
                expect(await GitBranch.isValidBranchName(illegalBranchName)).toBeFalsy();
            });


            it("will return false when the branch name contains any whitespace", async () => {
                const illegalBranchName = "whitespace\tis\tillegal";
                expect(await GitBranch.isValidBranchName(illegalBranchName)).toBeFalsy();
            });


            it("will return true when the branch name contains a '/'", async () => {
                const legalBranchName = "feature/feature_name";
                expect(await GitBranch.isValidBranchName(legalBranchName)).toBeTruthy();
            });


        });



        describe("create()", () => {

            it("will reject when given an illegal branch name", async () => {
                const repo = await GitRepo.fromDirectory(new Directory(__dirname, ".."));
                try
                {
                    await GitBranch.create(repo, "illegal:branch_name");
                    fail("Should never get here.");
                }
                catch (err)
                {
                }
            });


            it("will resolve to a GitBranch instance when given a valid branch name", async () => {
                const repo = await GitRepo.fromDirectory(new Directory(__dirname, ".."));
                try
                {
                    const branch = await GitBranch.create(repo, "feature/feature_name");
                    expect(branch).toBeTruthy();
                }
                catch (err)
                {
                    fail("Should never get here.");
                }
            });


        });

    });


    describe("instance", () => {


        describe("name", () => {


            it("will return the branch's name", async () => {
                const repo = await GitRepo.fromDirectory(new Directory(__dirname, ".."));
                const branch = await GitBranch.create(repo, "feature/featurename", "origin");
                expect(branch.name).toEqual("feature/featurename");
            });

        });


        describe("isLocal()", () => {


            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("returns true when the branch is local", async () => {
                const workingRepo = await GitRepo.clone(sampleRepoDir, tmpDir);
                const curBranch = await workingRepo.getCurrentBranch();
                expect(curBranch).toBeTruthy();
                expect(curBranch!.isLocal()).toEqual(true);
            });


            it("return false when the branch is remote", async () => {
                const repo = await GitRepo.fromDirectory(sampleRepoDir);
                const branch = await GitBranch.create(repo, "master", "origin");
                expect(branch.isLocal()).toEqual(false);
            });


        });


        describe("isRemote()", () => {


            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("returns false when the branch is local", async () => {
                const workingRepo = await GitRepo.clone(sampleRepoDir, tmpDir);
                const curBranch = await workingRepo.getCurrentBranch();
                expect(curBranch).toBeTruthy();
                expect(curBranch!.isRemote()).toEqual(false);
            });


            it("return true when the branch is remote", async () => {
                const repo = await GitRepo.fromDirectory(sampleRepoDir);
                const branch = await GitBranch.create(repo, "master", "origin");
                expect(branch.isRemote()).toEqual(true);
            });


        });


        describe("getTrackedBranch()", () => {

            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will resolve with the expected tracked branch", async () => {
                const originRepo  = await GitRepo.clone(sampleRepoDir, tmpDir, "origin");
                const workingRepo = await GitRepo.clone(originRepo.directory, tmpDir, "working");
                expect(originRepo).toBeTruthy();
                expect(workingRepo).toBeTruthy();

                const featureBranch = await GitBranch.create(workingRepo, "a_feature_branch");
                await workingRepo.checkoutBranch(featureBranch, true);
                await workingRepo.pushCurrentBranch("origin", true);

                const tracked = await featureBranch.getTrackedBranch();
                expect(tracked).toBeTruthy();
                expect(tracked!.name).toEqual("a_feature_branch");
                expect(tracked!.remoteName).toEqual("origin");
            });


            it("will resolve with undefined when the branch is not tracking", async () => {
                const originRepo  = await GitRepo.clone(sampleRepoDir, tmpDir, "origin");
                const workingRepo = await GitRepo.clone(originRepo.directory, tmpDir, "working");
                expect(originRepo).toBeTruthy();
                expect(workingRepo).toBeTruthy();

                const featureBranch = await GitBranch.create(workingRepo, "a_feature_branch");
                await workingRepo.checkoutBranch(featureBranch, true);
                await workingRepo.pushCurrentBranch("origin", false);  // This `false` is the key.  It is not tracking.

                const tracked = await featureBranch.getTrackedBranch();
                expect(tracked).toEqual(undefined);
            });


            it("returns a branch that is a remote branch", async () => {
                const originRepo  = await GitRepo.clone(sampleRepoDir, tmpDir, "origin");
                const workingRepo = await GitRepo.clone(originRepo.directory, tmpDir, "working");
                expect(originRepo).toBeTruthy();
                expect(workingRepo).toBeTruthy();

                const featureBranch = await GitBranch.create(workingRepo, "a_feature_branch");
                await workingRepo.checkoutBranch(featureBranch, true);
                await workingRepo.pushCurrentBranch("origin", true);

                const tracked = await featureBranch.getTrackedBranch();
                expect(tracked).toBeTruthy();
                expect(tracked!.isRemote()).toEqual(true);
            });

        });

    });


});
