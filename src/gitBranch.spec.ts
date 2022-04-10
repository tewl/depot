import {GitBranch} from "./gitBranch";
import {GitRepo} from "./gitRepo";
import {Directory} from "./directory";
import {sampleRepoDir, tmpDir} from "../test/ut/specHelpers";
import {failed, succeeded} from "./result";


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

            it("will error when given an illegal branch name", async () => {
                const repo = (await GitRepo.fromDirectory(new Directory(__dirname, ".."))).value!;
                const result = await GitBranch.create(repo, "illegal:branch_name");
                expect(failed(result)).toBeTrue();
            });


            it("will succeed and return a GitBranch instance when given a valid branch name", async () => {
                const repo = (await GitRepo.fromDirectory(new Directory(__dirname, ".."))).value!;
                const result = await GitBranch.create(repo, "feature/feature_name");
                expect(succeeded(result)).toBeTrue();
                expect(result.value! instanceof GitBranch).toBeTrue();
            });


        });

    });


    describe("instance", () => {

        describe("equals()", () => {
            it("returns true when the two represent the same local branch", async () => {
                const repo = (await GitRepo.fromDirectory(new Directory(__dirname, ".."))).value!;
                const branch1 = (await GitBranch.create(repo, "feature/featureName", undefined)).value!;
                const branch2 = (await GitBranch.create(repo, "feature/featureName", undefined)).value!;
                expect(branch1.equals(branch2)).toBeTrue();
                expect(branch2.equals(branch1)).toBeTrue();
            });


            it("returns true when the two branches are referencing the same remote branch", async () => {
                const repo = (await GitRepo.fromDirectory(new Directory(__dirname, ".."))).value!;
                const branch1 = (await GitBranch.create(repo, "feature/featureName", "origin")).value!;
                const branch2 = (await GitBranch.create(repo, "feature/featureName", "origin")).value!;
                expect(branch1.equals(branch2)).toBeTrue();
                expect(branch2.equals(branch1)).toBeTrue();
            });


            it("returns false when the two local branches are pointing at different branches", async () => {
                const repo = (await GitRepo.fromDirectory(new Directory(__dirname, ".."))).value!;
                const branch1 = (await GitBranch.create(repo, "feature/featureA", undefined)).value!;
                const branch2 = (await GitBranch.create(repo, "feature/featureB", undefined)).value!;
                expect(branch1.equals(branch2)).toBeFalse();
                expect(branch2.equals(branch1)).toBeFalse();
            });


            it("returns false when the two remote branches are pointing at the same remote but different branches", async () => {
                const repo = (await GitRepo.fromDirectory(new Directory(__dirname, ".."))).value!;
                const branch1 = (await GitBranch.create(repo, "feature/featureA", "origin")).value!;
                const branch2 = (await GitBranch.create(repo, "feature/featureB", "origin")).value!;
                expect(branch1.equals(branch2)).toBeFalse();
                expect(branch2.equals(branch1)).toBeFalse();
            });


            it("returns false when the two remote branches are pointing at different remotes", async () => {
                const repo = (await GitRepo.fromDirectory(new Directory(__dirname, ".."))).value!;
                const branch1 = (await GitBranch.create(repo, "feature/featureName", "origin1")).value!;
                const branch2 = (await GitBranch.create(repo, "feature/featureName", "origin2")).value!;
                expect(branch1.equals(branch2)).toBeFalse();
                expect(branch2.equals(branch1)).toBeFalse();
            });
        });


        describe("exists()", () => {
            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("returns true for a branch that exists", async () => {
                const workingRepo = await GitRepo.clone(sampleRepoDir, tmpDir);
                const curBranch = await workingRepo.getCurrentBranch();
                expect(curBranch).toBeTruthy();
                expect(await curBranch!.exists()).toBeTrue();
            });


            it("returns false for a branch that does not exist", async () => {
                const workingRepo = await GitRepo.clone(sampleRepoDir, tmpDir);
                const fakeBranch = (await GitBranch.create(workingRepo, "doesnotexist")).value!;
                expect(fakeBranch).toBeTruthy();
                expect(await fakeBranch.exists()).toBeFalse();
            });
        });

        describe("name", () => {

            it("will return the branch's name", async () => {
                const repo = (await GitRepo.fromDirectory(new Directory(__dirname, ".."))).value!;
                const branch = (await GitBranch.create(repo, "feature/featurename", "origin")).value!;
                expect(branch.name).toEqual("feature/featurename");
            });

        });


        describe("toString()", () => {

            it("returns the expected string for a local branch", async () => {
                const repo = (await GitRepo.fromDirectory(sampleRepoDir)).value!;
                const branch = (await GitBranch.create(repo, "master")).value!;
                expect(branch.toString()).toEqual("master");
            });


            it("returns the expected string for a remote branch", async () => {
                const repo = (await GitRepo.fromDirectory(sampleRepoDir)).value!;
                const branch = (await GitBranch.create(repo, "master", "origin")).value!;
                expect(branch.toString()).toEqual("origin/master");
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
                const repo = (await GitRepo.fromDirectory(sampleRepoDir)).value!;
                const branch = (await GitBranch.create(repo, "master", "origin")).value!;
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
                const repo = (await GitRepo.fromDirectory(sampleRepoDir)).value!;
                const branch = (await GitBranch.create(repo, "master", "origin")).value!;
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

                const featureBranch = (await GitBranch.create(workingRepo, "a_feature_branch")).value!;
                await workingRepo.checkoutBranch(featureBranch, true);
                await workingRepo.pushCurrentBranch("origin", true);

                const tracked = await featureBranch.getTrackedBranch();
                expect(tracked).toBeTruthy();
                expect(tracked!.name).toEqual("a_feature_branch");
                expect(tracked!.remoteName).toEqual("origin");
            }, 1000 * 10);


            it("will resolve with undefined when the branch is not tracking", async () => {
                const originRepo  = await GitRepo.clone(sampleRepoDir, tmpDir, "origin");
                const workingRepo = await GitRepo.clone(originRepo.directory, tmpDir, "working");
                expect(originRepo).toBeTruthy();
                expect(workingRepo).toBeTruthy();

                const featureBranch = (await GitBranch.create(workingRepo, "a_feature_branch")).value!;
                await workingRepo.checkoutBranch(featureBranch, true);
                await workingRepo.pushCurrentBranch("origin", false);  // This `false` is the key.  It is not tracking.

                const tracked = await featureBranch.getTrackedBranch();
                expect(tracked).toEqual(undefined);
            }, 1000 * 10);


            it("returns a branch that is a remote branch", async () => {
                const originRepo  = await GitRepo.clone(sampleRepoDir, tmpDir, "origin");
                const workingRepo = await GitRepo.clone(originRepo.directory, tmpDir, "working");
                expect(originRepo).toBeTruthy();
                expect(workingRepo).toBeTruthy();

                const featureBranch = (await GitBranch.create(workingRepo, "a_feature_branch")).value!;
                await workingRepo.checkoutBranch(featureBranch, true);
                await workingRepo.pushCurrentBranch("origin", true);

                const tracked = await featureBranch.getTrackedBranch();
                expect(tracked).toBeTruthy();
                expect(tracked!.isRemote()).toEqual(true);
            }, 1000 * 10);

        });

    });


});
